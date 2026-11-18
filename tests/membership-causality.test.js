'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const { EVENT_TYPES } = require('../src/events/eventTypes/event-types');

test('concurrent JOIN and PART do not create false causal ordering', () => {
    const sim = new PartitionSimulator();

    sim.disconnect();

    const join = sim.emit(
        'A',
        EVENT_TYPES.CHANNEL_JOIN,
        'user-1',
        {
            channel: '#iris'
        }
    );

    const part = sim.emit(
        'B',
        EVENT_TYPES.CHANNEL_PART,
        'user-1',
        {
            channel: '#iris'
        }
    );

    assert.equal(
        join.causalContext.B || 0,
        0
    );

    assert.equal(
        part.causalContext.A || 0,
        0
    );

    const result = sim.reconnect();

    assert.equal(result.converged, true);
});

test('concurrent JOIN survives PART that did not causally observe it', () => {
    const sim = new PartitionSimulator();

    sim.disconnect();

    sim.emit(
        'A',
        EVENT_TYPES.CHANNEL_JOIN,
        'user-1',
        {
            channel: '#iris'
        }
    );

    sim.emit(
        'B',
        EVENT_TYPES.CHANNEL_PART,
        'user-1',
        {
            channel: '#iris'
        }
    );

    sim.reconnect();

    const snapshotA = sim.getSnapshot('A');
    const snapshotB = sim.getSnapshot('B');

    assert.deepEqual(snapshotA, snapshotB);

    const channel = snapshotA.channels['#iris'];

    assert.ok(channel);
    assert.ok(
        channel.members.includes('user-1'),
        'concurrent JOIN should survive an unseen PART'
    );
});

test('PART removes only the JOIN it causally observed', () => {
    const simulator = new PartitionSimulator();

    // First JOIN reaches both servers.
    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    // Network partition.
    simulator.disconnect();

    // A creates another JOIN during the partition.
    const secondJoin = simulator.emit(
        'A',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-1',
        { channel: '#iris' }
    );

    // B creates a PART that has seen only the first JOIN.
    const part = simulator.emit(
        'B',
        EVENT_TYPES.CHANNEL_PART,
        'account-1',
        { channel: '#iris' }
    );

    // PART must see the first JOIN, but not the second.
    assert.equal(
        part.causalContext.A,
        1
    );

    assert.equal(secondJoin.sequence, 2);

    // Reconnect and merge both histories.
    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    // The second JOIN must survive.
    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].members,
        ['account-1']
    );

    assert.deepEqual(
        simulator.getSnapshot('B').channels['#iris'].members,
        ['account-1']
    );
});
