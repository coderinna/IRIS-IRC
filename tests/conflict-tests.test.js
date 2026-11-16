
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const PartitionSimulator = require('../src/simulation/partition-simulator');
const {
    createEvent,
    EVENT_TYPES
} = require('../src/events/event-types');

function createInitialState() {
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

function createSimulator() {
    return new PartitionSimulator(createInitialState());
}

test('1. simultaneous nick changes: server B wins by server ID ordering', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniB' }
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
    assert.equal(
        simulator.getSnapshot('A').accounts['account-1'].primaryNick,
        'NinniB'
    );
});

test('2. concurrent JOIN on A and PART on B: unseen JOIN survives', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_PART, 'account-1', {
        channel: '#iris'
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].members,
        ['account-1']
    );
});

test('3. concurrent PART on A and JOIN on B: JOIN survives', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_PART, 'account-1', {
        channel: '#iris'
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].members,
        ['account-1']
    );
});

test('4. simultaneous channel power changes: server B value wins', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 20 }
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_POWER, 'operator-2', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 80 }
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
    assert.equal(
        simulator.getSnapshot('A').channels['#iris'].powers['account-1'],
        80
    );
});

test('5. same-server events are applied by sequence, not arrival order', () => {
    const simulator = createSimulator();

    const joinEvent = createEvent({
        serverId: 'A',
        sequence: 1,
        type: EVENT_TYPES.CHANNEL_JOIN,
        actorId: 'account-1',
        channel: '#iris'
    });

    const partEvent = createEvent({
        serverId: 'A',
        sequence: 2,
        type: EVENT_TYPES.CHANNEL_PART,
        actorId: 'account-1',
        channel: '#iris'
    });

    const nodeA = simulator.getNode('A');

    nodeA.receive(partEvent);
    nodeA.receive(joinEvent);

    assert.deepEqual(
        nodeA.getSnapshot().channels['#iris'].members,
        []
    );
});

test('6. different delivery orders produce the same state on both servers', () => {
    const simulator = createSimulator();

    const nickEvent = createEvent({
        serverId: 'A',
        sequence: 1,
        type: EVENT_TYPES.NICK_CHANGE,
        actorId: 'account-1',
        data: { newNick: 'NinniA' }
    });

    const joinEvent = createEvent({
        serverId: 'B',
        sequence: 1,
        type: EVENT_TYPES.CHANNEL_JOIN,
        actorId: 'account-1',
        channel: '#iris'
    });

    const nodeA = simulator.getNode('A');
    const nodeB = simulator.getNode('B');

    nodeA.receive(nickEvent);
    nodeA.receive(joinEvent);

    nodeB.receive(joinEvent);
    nodeB.receive(nickEvent);

    assert.deepEqual(nodeA.getSnapshot(), nodeB.getSnapshot());
});

test('7. reconnect after conflicting changes converges in history and state', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniB' }
    });

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_PART, 'account-1', {
        channel: '#iris'
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    assert.deepEqual(
        simulator.getEvents('A'),
        simulator.getEvents('B')
    );

    assert.deepEqual(
        simulator.getSnapshot('A'),
        simulator.getSnapshot('B')
    );

    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].members,
        ['account-1']
    );
});
