'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const StateMachine = require('../src/state/state-machine');
const {
    createEvent,
    EVENT_TYPES
} = require('../src/events/event-types');

function event(serverId, sequence, type, actorId, options = {}) {
    return createEvent({
        serverId,
        sequence,
        type,
        actorId,
        targetId: options.targetId ?? null,
        channel: options.channel ?? null,
        data: options.data ?? {}
    });
}

function register(serverId = 'A', sequence = 1) {
    return event(serverId, sequence, EVENT_TYPES.ID_REGISTER, 'account-1', {
        data: { primaryNick: 'Ninni' }
    });
}

test('1. registers an account', () => {
    const machine = new StateMachine();

    machine.add(register());

    assert.deepEqual(machine.getAccount('account-1'), {
        primaryNick: 'Ninni'
    });
});

test('2. changes an account nick', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'Ninni2' }
    }));

    assert.equal(machine.getAccount('account-1').primaryNick, 'Ninni2');
});

test('3. applies nick changes in deterministic order', () => {
    const machine = new StateMachine();

    machine.add(event('B', 1, EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'Ninni-B' }
    }));

    machine.add(event('A', 1, EVENT_TYPES.NICK_CHANGE, 'account-1', {
        data: { newNick: 'Ninni-A' }
    }));

    assert.equal(machine.getAccount('account-1').primaryNick, 'Ninni-B');
});

test('4. authenticates a session to an account', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.ID_AUTH, 'account-1', {
        data: { sessionId: 'session-1' }
    }));

    assert.equal(machine.getSessionAccount('session-1'), 'account-1');
});

test('5. joins a channel', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    }));

    assert.deepEqual(machine.getChannel('#iris').members, ['account-1']);
});

test('6. parts a channel', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    }));

    machine.add(event('A', 2, EVENT_TYPES.CHANNEL_PART, 'account-1', {
        channel: '#iris'
    }));

    assert.deepEqual(machine.getChannel('#iris').members, []);
});

test('7. stores channel power', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 50 }
    }));

    assert.equal(machine.getChannel('#iris').powers['account-1'], 50);
});

test('8. accepts power level zero', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
        channel: '#iris',
        targetId: 'account-1',
        data: { level: 0 }
    }));

    assert.equal(machine.getChannel('#iris').powers['account-1'], 0);
});

test('9. rejects power level above 100', () => {
    const machine = new StateMachine();

    assert.throws(() => machine.add(
        event('A', 1, EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
            channel: '#iris',
            targetId: 'account-1',
            data: { level: 101 }
        })
    ), /Invalid channel power event/);
});

test('10. rejects negative power level', () => {
    const machine = new StateMachine();

    assert.throws(() => machine.add(
        event('A', 1, EVENT_TYPES.CHANNEL_POWER, 'operator-1', {
            channel: '#iris',
            targetId: 'account-1',
            data: { level: -1 }
        })
    ), /Invalid channel power event/);
});

test('11. stores channel lock settings', () => {
    const machine = new StateMachine();

    machine.add(event('A', 1, EVENT_TYPES.CHANNEL_LOCK, 'operator-1', {
        channel: '#iris',
        data: {
            lock: {
                inviteOnly: true,
                moderated: true
            }
        }
    }));

    assert.deepEqual(machine.getChannel('#iris').lock, {
        inviteOnly: true,
        moderated: true
    });
});

test('12. returns null for an unknown account', () => {
    const machine = new StateMachine();

    assert.equal(machine.getAccount('unknown'), null);
});

test('13. returns null for an unknown channel', () => {
    const machine = new StateMachine();

    assert.equal(machine.getChannel('#unknown'), null);
});

test('14. ignores duplicate event IDs', () => {
    const machine = new StateMachine();
    const join = event('A', 1, EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    });

    assert.equal(machine.add(join), true);
    assert.equal(machine.add(join), false);
    assert.equal(machine.size, 1);
});

test('15. merges multiple events', () => {
    const machine = new StateMachine();

    const result = machine.merge([
        register(),
        event('A', 2, EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
            channel: '#iris'
        })
    ]);

    assert.deepEqual(result, {
        accepted: 2,
        duplicates: 0
    });

    assert.equal(machine.size, 2);
});

test('16. counts duplicate events during merge', () => {
    const machine = new StateMachine();
    const first = register();

    machine.add(first);

    const result = machine.merge([first]);

    assert.deepEqual(result, {
        accepted: 0,
        duplicates: 1
    });
});

test('17. rejects invalid event data', () => {
    const machine = new StateMachine();

    assert.throws(
        () => machine.add(null),
        /Invalid state event/
    );
});

test('18. rejects channel events without channel name', () => {
    const machine = new StateMachine();

    assert.throws(
        () => machine.add(
            event('A', 1, EVENT_TYPES.CHANNEL_JOIN, 'account-1')
        ),
        /Channel is required/
    );
});

test('19. returns a stable snapshot', () => {
    const machine = new StateMachine();

    machine.add(register());

    machine.add(event('A', 2, EVENT_TYPES.CHANNEL_JOIN, 'account-1', {
        channel: '#iris'
    }));

    const first = machine.getSnapshot();
    const second = machine.getSnapshot();

    assert.deepEqual(first, second);
});

test('20. protects internal state from snapshot mutation', () => {
    const machine = new StateMachine();

    machine.add(register());

    const snapshot = machine.getSnapshot();
    snapshot.accounts['account-1'].primaryNick = 'Modified';

    assert.equal(
        machine.getAccount('account-1').primaryNick,
        'Ninni'
    );
});
