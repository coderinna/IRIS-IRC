'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const { EVENT_TYPES } = require('../src/events/eventTypes/event-types');

function createInitialState() {
    const { createEvent } = require('../src/events/eventTypes/event-types');

    return [
        createEvent({
            serverId: '0-BASE',
            sequence: 1,
            type: EVENT_TYPES.ID_REGISTER,
            actorId: 'account-1',
            data: { primaryNick: 'Ninni' }
        })
    ];
}

test('1. event records the server history it has seen', () => {
    const simulator = new PartitionSimulator(createInitialState());

    const event = simulator.emit(
        'A',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniA' } }
    );

    assert.deepEqual(event.causalContext, {
        '0-BASE': 1
    });
});

test('2. event sees earlier events received from another server', () => {
    const simulator = new PartitionSimulator(createInitialState());

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    const eventB = simulator.emit(
        'B',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniB' } }
    );

    assert.equal(eventB.causalContext.A, 1);
});

test('3. causal order takes priority over local sequence numbers', () => {
    const simulator = new PartitionSimulator(createInitialState());

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA1' }
    });

    const eventA2 = simulator.emit(
        'A',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniA2' } }
    );

    const eventB1 = simulator.emit(
        'B',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniB1' } }
    );

    assert.equal(eventA2.sequence, 2);
    assert.equal(eventB1.sequence, 1);
    assert.equal(eventB1.causalContext.A, 2);

    const ordered = simulator.getEvents('A');

    const indexA2 = ordered.findIndex(
        event => event.eventId === eventA2.eventId
    );

    const indexB1 = ordered.findIndex(
        event => event.eventId === eventB1.eventId
    );

    assert.ok(indexA2 < indexB1);

    assert.equal(
        simulator.getSnapshot('A').accounts['account-1'].primaryNick,
        'NinniB1'
    );
});

test('4. concurrent events do not claim causal dependency', () => {
    const simulator = new PartitionSimulator(createInitialState());

    simulator.disconnect();

    const eventA = simulator.emit(
        'A',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniA' } }
    );

    const eventB = simulator.emit(
        'B',
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'NinniB' } }
    );

    assert.equal(eventA.causalContext.B, undefined);
    assert.equal(eventB.causalContext.A, undefined);
});

test('5. servers converge after exchanging causally ordered events', () => {
    const simulator = new PartitionSimulator(createInitialState());

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniB' }
    });

    assert.equal(simulator.hasConverged(), true);
});


test('6. causal history advances only when missing sequences arrive', () => {
    const simulator = new PartitionSimulator([], ['A', 'B']);

    const nodeA = simulator.getNode('A');
    const nodeB = simulator.getNode('B');

    // A creates three causally ordered events.
    const event1 = nodeA.createEvent(
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'Ninni1' } }
    );
    nodeA.receive(event1);

    const event2 = nodeA.createEvent(
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'Ninni2' } }
    );
    nodeA.receive(event2);

    const event3 = nodeA.createEvent(
        EVENT_TYPES.NICK_CHANGE,
        'account-1',
        { data: { newNick: 'Ninni3' } }
    );
    nodeA.receive(event3);

    // B receives event 1 and event 3, but misses event 2.
    nodeB.receive(event1);
    nodeB.receive(event3);

    assert.equal(nodeB.vector.get('A'), 1);

    // Once event 2 arrives, B can advance its causal history.
    nodeB.receive(event2);

    assert.equal(nodeB.vector.get('A'), 3);
});
