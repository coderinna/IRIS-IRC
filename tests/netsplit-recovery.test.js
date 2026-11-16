
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const { EVENT_TYPES } = require('../src/events/event-types');

test('protocol v2 recovers three-server netsplit with complete causal histories', () => {
    const simulator = new PartitionSimulator([], ['A', 'B', 'C']);

    const A = simulator.getNode('A');
    const B = simulator.getNode('B');
    const C = simulator.getNode('C');

    // 1. Initial network: A <-> B <-> C
    simulator.disconnect();
    simulator.connect('A', 'B');
    simulator.connect('B', 'C');

    const registerA = simulator.emit(
        'A',
        EVENT_TYPES.ID_REGISTER,
        'account-A',
        { data: { primaryNick: 'NinniA' } }
    );

    // Forward A's event through B to C.
    assert.equal(C.receive(registerA), true);

    const registerB = simulator.emit(
        'B',
        EVENT_TYPES.ID_REGISTER,
        'account-B',
        { data: { primaryNick: 'NinniB' } }
    );

    const registerC = simulator.emit(
        'C',
        EVENT_TYPES.ID_REGISTER,
        'account-C',
        { data: { primaryNick: 'NinniC' } }
    );

    // 2. Create a netsplit: A becomes isolated.
    simulator.disconnect('A', 'B');

    assert.equal(simulator.isConnected('A', 'B'), false);
    assert.equal(simulator.isConnected('B', 'C'), true);

    // 3. All network partitions continue operating.
    const a1 = simulator.emit(
        'A',
        EVENT_TYPES.NICK_CHANGE,
        'account-A',
        { data: { newNick: 'NinniA-Offline' } }
    );

    const b1 = simulator.emit(
        'B',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-B',
        { channel: '#iris' }
    );

    const c1 = simulator.emit(
        'C',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-C',
        { channel: '#iris' }
    );

const b2 = simulator.emit(
    'B',
    EVENT_TYPES.CHANNEL_POWER,
    'account-B',
    {
        channel: '#iris',
        targetId: 'account-B',
        data: { level: 50 }
    }
);

    const a2 = simulator.emit(
        'A',
        EVENT_TYPES.CHANNEL_JOIN,
        'account-A',
        { channel: '#iris' }
    );

    // 4. Verify that the partition really isolated A.
    assert.equal(
        A.getEvents().some(event => event.eventId === b1.eventId),
        false
    );

    assert.equal(
        A.getEvents().some(event => event.eventId === c1.eventId),
        false
    );

    assert.equal(
        B.getEvents().some(event => event.eventId === a1.eventId),
        false
    );

    assert.equal(
        C.getEvents().some(event => event.eventId === a2.eventId),
        false
    );

    // B and C must still exchange events during A's isolation.
    assert.equal(
        B.getEvents().some(event => event.eventId === c1.eventId),
        true
    );

    assert.equal(
        C.getEvents().some(event => event.eventId === b2.eventId),
        true
    );

    // 5. Simulate out-of-order delivery to A.
    // A receives B's second event before B's first event.
assert.equal(A.receive(b2), true);
assert.equal(A.vector.get('B'), 1);

// Deliver the missing earlier event.
assert.equal(A.receive(b1), true);
assert.equal(A.vector.get('B'), 3);

    // 6. Restore network and merge histories.
    const recovery = simulator.reconnect();

    assert.equal(recovery.converged, true);

    // 7. All nodes must have identical event histories.
    assert.deepEqual(A.getEvents(), B.getEvents());
    assert.deepEqual(B.getEvents(), C.getEvents());

    // 8. All causal vectors must contain complete server histories.
    for (const node of [A, B, C]) {
        assert.equal(node.vector.get('A'), 3);
       assert.equal(node.vector.get('B'), 3);
        assert.equal(node.vector.get('C'), 2);
    }

    // 9. All nodes must converge to the same state.
    assert.deepEqual(A.getSnapshot(), B.getSnapshot());
    assert.deepEqual(B.getSnapshot(), C.getSnapshot());

    const snapshot = A.getSnapshot();

    assert.equal(
        snapshot.accounts['account-A'].primaryNick,
        'NinniA-Offline'
    );

    assert.deepEqual(
        snapshot.channels['#iris'].members,
        ['account-A', 'account-B', 'account-C']
    );

    // 10. Repeated recovery and duplicate delivery are harmless.
    const eventCount = A.getEvents().length;

    for (const event of A.getEvents()) {
        assert.equal(B.receive(event), false);
        assert.equal(C.receive(event), false);
    }

    const secondRecovery = simulator.reconnect();

    assert.equal(secondRecovery.converged, true);
    assert.equal(A.getEvents().length, eventCount);
    assert.equal(B.getEvents().length, eventCount);
    assert.equal(C.getEvents().length, eventCount);
});
