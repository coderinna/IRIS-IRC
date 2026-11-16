
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const { EVENT_TYPES } = require('../src/events/event-types');

test('three-server topology survives partitions, duplicate delivery and recovery', () => {
    const simulator = new PartitionSimulator([], ['A', 'B', 'C']);

    const nodeA = simulator.getNode('A');
    const nodeB = simulator.getNode('B');
    const nodeC = simulator.getNode('C');

    // --------------------------------------------------
    // 1. Build a chain topology: A <-> B <-> C
    // --------------------------------------------------

    simulator.disconnect();

    simulator.connect('A', 'B');
    simulator.connect('B', 'C');

    assert.equal(simulator.isConnected('A', 'B'), true);
    assert.equal(simulator.isConnected('B', 'C'), true);
    assert.equal(simulator.isConnected('A', 'C'), false);

    // A creates an event.
    const eventA = simulator.emit(
        'A',
        EVENT_TYPES.ID_REGISTER,
        'account-A',
        { data: { primaryNick: 'NinniA' } }
    );

    // B receives A's event, but C is not directly connected.
    assert.equal(
        nodeB.getEvents().some(event => event.eventId === eventA.eventId),
        true
    );

    assert.equal(
        nodeC.getEvents().some(event => event.eventId === eventA.eventId),
        false
    );

    // Simulate B forwarding the event to C.
    assert.equal(nodeC.receive(eventA), true);

    // Receiving the same event again must be harmless.
    assert.equal(nodeC.receive(eventA), false);

    assert.equal(nodeC.getEvents().length, 1);

    // --------------------------------------------------
    // 2. Create a triangle and remove one connection
    // --------------------------------------------------

    simulator.connect('A', 'C');

    assert.equal(simulator.isConnected('A', 'C'), true);

    simulator.disconnect('A', 'C');

    assert.equal(simulator.isConnected('A', 'C'), false);
    assert.equal(simulator.isConnected('A', 'B'), true);
    assert.equal(simulator.isConnected('B', 'C'), true);

    // B creates a causally later event.
    const eventB = simulator.emit(
        'B',
        EVENT_TYPES.ID_REGISTER,
        'account-B',
        { data: { primaryNick: 'NinniB' } }
    );

    // C receives B's event over the surviving B-C link.
    assert.equal(
        nodeC.getEvents().some(event => event.eventId === eventB.eventId),
        true
    );

    // A is still connected to B, so it also receives B's event.
    assert.equal(
        nodeA.getEvents().some(event => event.eventId === eventB.eventId),
        true
    );

    // --------------------------------------------------
    // 3. Isolate A while B and C remain connected
    // --------------------------------------------------

    simulator.disconnect('A', 'B');

    assert.equal(simulator.isConnected('A', 'B'), false);
    assert.equal(simulator.isConnected('B', 'C'), true);

    const eventC = simulator.emit(
        'C',
        EVENT_TYPES.ID_REGISTER,
        'account-C',
        { data: { primaryNick: 'NinniC' } }
    );

    // C's event reaches B, but not isolated A.
    assert.equal(
        nodeB.getEvents().some(event => event.eventId === eventC.eventId),
        true
    );

    assert.equal(
        nodeA.getEvents().some(event => event.eventId === eventC.eventId),
        false
    );

    // B creates a channel membership change during the partition.
    const joinB = simulator.emit(
        'B',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-B',
        { channel: '#iris' }
    );

    // C receives it over B-C.
    assert.equal(
        nodeC.getEvents().some(event => event.eventId === joinB.eventId),
        true
    );

    // A creates an independent membership change while isolated.
    const joinA = simulator.emit(
        'A',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-A',
        { channel: '#iris' }
    );

    assert.equal(
        nodeB.getEvents().some(event => event.eventId === joinA.eventId),
        false
    );

    // --------------------------------------------------
    // 4. Restore the network and merge all histories
    // --------------------------------------------------

    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    const expectedAccounts = {
        'account-A': { primaryNick: 'NinniA' },
        'account-B': { primaryNick: 'NinniB' },
        'account-C': { primaryNick: 'NinniC' }
    };

    const expectedMembers = ['account-A', 'account-B'];

    for (const serverId of ['A', 'B', 'C']) {
        const snapshot = simulator.getSnapshot(serverId);

        assert.deepEqual(snapshot.accounts, expectedAccounts);

        assert.deepEqual(
            snapshot.channels['#iris'].members,
            expectedMembers
        );
    }

    // All servers must now have identical event histories.
    assert.deepEqual(nodeA.getEvents(), nodeB.getEvents());
    assert.deepEqual(nodeB.getEvents(), nodeC.getEvents());

    const eventCount = nodeA.getEvents().length;

    // --------------------------------------------------
    // 5. Repeated delivery and reconnect must not duplicate
    // --------------------------------------------------

    for (const event of nodeA.getEvents()) {
        assert.equal(nodeB.receive(event), false);
        assert.equal(nodeC.receive(event), false);
    }

    const secondReconnect = simulator.reconnect();

    assert.equal(secondReconnect.converged, true);

    assert.equal(nodeA.getEvents().length, eventCount);
    assert.equal(nodeB.getEvents().length, eventCount);
    assert.equal(nodeC.getEvents().length, eventCount);

    assert.deepEqual(nodeA.getSnapshot(), nodeB.getSnapshot());
    assert.deepEqual(nodeB.getSnapshot(), nodeC.getSnapshot());
});
