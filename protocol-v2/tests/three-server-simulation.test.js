
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const { EVENT_TYPES } = require('../src/events/event-types');

test('three servers converge after a partial network partition', () => {
    const simulator = new PartitionSimulator([], ['A', 'B', 'C']);

    // A becomes isolated. B and C remain connected.
    simulator.disconnect('A', 'B');
    simulator.disconnect('A', 'C');

    assert.equal(simulator.isConnected('A', 'B'), false);
    assert.equal(simulator.isConnected('A', 'C'), false);
    assert.equal(simulator.isConnected('B', 'C'), true);

    // All three servers make independent changes.
    simulator.emit('A', EVENT_TYPES.ID_REGISTER, 'account-A', {
        data: { primaryNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.ID_REGISTER, 'account-B', {
        data: { primaryNick: 'NinniB' }
    });

    simulator.emit('C', EVENT_TYPES.ID_REGISTER, 'account-C', {
        data: { primaryNick: 'NinniC' }
    });

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-A', {
        channel: '#iris'
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-B', {
        channel: '#iris'
    });

    simulator.emit('C', EVENT_TYPES.CHANNEL_JOIN, 'account-C', {
        channel: '#iris'
    });

    // A must not know about B or C's events.
    assert.equal(simulator.getEvents('A').length, 2);

    // B and C exchange events over their surviving connection.
    assert.equal(simulator.getEvents('B').length, 4);
    assert.equal(simulator.getEvents('C').length, 4);

    // Restore the network and synchronize all three servers.
    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    const expectedMembers = [
        'account-A',
        'account-B',
        'account-C'
    ];

    for (const serverId of ['A', 'B', 'C']) {
        const snapshot = simulator.getSnapshot(serverId);

        assert.deepEqual(
            snapshot.channels['#iris'].members,
            expectedMembers
        );

        assert.equal(
            Object.keys(snapshot.accounts).length,
            3
        );
    }

    assert.deepEqual(
        simulator.getEvents('A'),
        simulator.getEvents('B')
    );

    assert.deepEqual(
        simulator.getEvents('B'),
        simulator.getEvents('C')
    );
});

test('three servers preserve causal membership across a partition', () => {
    const simulator = new PartitionSimulator([], ['A', 'B', 'C']);

    // Initial JOIN is shared by all servers.
    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    // Isolate A while B and C remain connected.
    simulator.disconnect('A', 'B');
    simulator.disconnect('A', 'C');

    // A performs a second JOIN.
    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    // B performs PART. It has seen only the first JOIN.
    const part = simulator.emit(
        'B',
        EVENT_TYPES.CHANNEL_PART,
        'account-1',
        { channel: '#iris' }
    );

    // C must receive B's PART through the B-C link.
    assert.equal(
        simulator.getEvents('C').some(
            event => event.eventId === part.eventId
        ),
        true
    );

    assert.equal(part.causalContext.A, 1);

    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    for (const serverId of ['A', 'B', 'C']) {
        assert.deepEqual(
            simulator.getSnapshot(serverId).channels['#iris'].members,
            ['account-1']
        );
    }
});
