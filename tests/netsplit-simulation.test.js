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
            data: {
                primaryNick: 'Ninni'
            }
        })
    ];
}

function createSimulator() {
    return new PartitionSimulator(createInitialState());
}

test('1. starts with two synchronized servers', () => {
    const simulator = createSimulator();

    assert.equal(simulator.hasConverged(), true);
});

test('2. disconnects the servers', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    assert.equal(simulator.connected, false);
});

test('3. allows server A to operate during partition', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    assert.equal(
        simulator.getSnapshot('A').accounts['account-1'].primaryNick,
        'NinniA'
    );
});

test('4. allows server B to operate during partition', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    assert.deepEqual(
        simulator.getSnapshot('B').channels['#iris'].members,
        ['account-1']
    );
});

test('5. does not share events during partition', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    assert.equal(
        simulator.getSnapshot('B').accounts['account-1'].primaryNick,
        'Ninni'
    );
});

test('6. merges server A events after reconnect', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
    assert.equal(
        simulator.getSnapshot('B').accounts['account-1'].primaryNick,
        'NinniA'
    );
});

test('7. merges server B events after reconnect', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.reconnect();

    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].members,
        ['account-1']
    );
});

test('8. merges independent changes from both servers', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);

    const snapshot = simulator.getSnapshot('A');

    assert.equal(snapshot.accounts['account-1'].primaryNick, 'NinniA');
    assert.deepEqual(snapshot.channels['#iris'].members, ['account-1']);
});

test('9. resolves simultaneous nick changes deterministically', () => {
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

test('10. merges channel power changes', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 50 }
    });

    simulator.reconnect();

    assert.equal(
        simulator.getSnapshot('B').channels['#iris'].powers['account-1'],
        50
    );
});

test('11. merges channel lock changes', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('B', EVENT_TYPES.CHANNEL_LOCK, 'operator-1', {
        channel: '#iris',
        data: {
            lock: {
                inviteOnly: true,
                moderated: true
            }
        }
    });

    simulator.reconnect();

    assert.deepEqual(
        simulator.getSnapshot('A').channels['#iris'].lock,
        {
            inviteOnly: true,
            moderated: true
        }
    );
});

test('12. repeated reconnect does not duplicate events', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.reconnect();
    simulator.reconnect();

    assert.equal(
        simulator.getEvents('A').length,
        simulator.getEvents('B').length
    );
});

test('13. both servers have identical event histories after reconnect', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.reconnect();

    assert.deepEqual(
        simulator.getEvents('A'),
        simulator.getEvents('B')
    );
});

test('14. both servers converge after multiple independent events', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.emit('A', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniA' }
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 50 }
    });

    simulator.emit('B', EVENT_TYPES.CHANNEL_LOCK, 'operator-1', {
        channel: '#iris',
        data: {
            lock: { inviteOnly: true }
        }
    });

    const result = simulator.reconnect();

    assert.equal(result.converged, true);
});

test('15. servers continue sharing events after reconnect', () => {
    const simulator = createSimulator();

    simulator.disconnect();

    simulator.emit('A', EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    simulator.reconnect();

    simulator.emit('B', EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'NinniAfterSplit' }
    });

    assert.equal(simulator.hasConverged(), true);

    assert.equal(
        simulator.getSnapshot('A').accounts['account-1'].primaryNick,
        'NinniAfterSplit'
    );
});
