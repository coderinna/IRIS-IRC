'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const EventLog = require('../src/events/event-log');
const {
    createEvent,
    EVENT_TYPES
} = require('../src/events/event-types');

function makeEvent(serverId = 'A', sequence = 1) {
    return createEvent({
        serverId,
        sequence,
        type: EVENT_TYPES.NICK_CHANGE,
        actorId: 'account-1',
        data: {
            oldNick: 'Ninni',
            newNick: `Ninni${sequence}`
        }
    });
}

test('1. stores a new event', () => {
    const log = new EventLog();

    assert.equal(log.add(makeEvent()), true);
    assert.equal(log.size, 1);
});

test('2. rejects duplicate events', () => {
    const log = new EventLog();
    const event = makeEvent();

    assert.equal(log.add(event), true);
    assert.equal(log.add(event), false);
    assert.equal(log.size, 1);
});

test('3. allows same sequence on different servers', () => {
    const log = new EventLog();

    assert.equal(log.add(makeEvent('A', 1)), true);
    assert.equal(log.add(makeEvent('B', 1)), true);
    assert.equal(log.size, 2);
});

test('4. rejects conflicting sequence on same server', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));

    const conflictingEvent = {
        ...makeEvent('A', 1),
        eventId: 'A:another-event'
    };

    assert.throws(
        () => log.add(conflictingEvent),
        /Sequence conflict/
    );
});

test('5. detects one missing sequence', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 3));

    assert.deepEqual(
        log.getMissingSequences('A', 3),
        [2]
    );
});

test('6. detects multiple missing sequences', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 4));

    assert.deepEqual(
        log.getMissingSequences('A', 5),
        [2, 3, 5]
    );
});

test('7. returns no missing sequences for complete history', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 2));
    log.add(makeEvent('A', 3));

    assert.deepEqual(
        log.getMissingSequences('A', 3),
        []
    );
});

test('8. accepts events in different arrival orders', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 3));
    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 2));

    assert.equal(log.size, 3);
});

test('9. returns events in sequence order', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 3));
    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 2));

    assert.deepEqual(
        log.getByServer('A').map(event => event.sequence),
        [1, 2, 3]
    );
});

test('10. returns null for unknown events', () => {
    const log = new EventLog();

    assert.equal(log.get('unknown'), null);
});

test('11. checks whether an event exists', () => {
    const log = new EventLog();
    const event = makeEvent();

    log.add(event);

    assert.equal(log.has(event.eventId), true);
    assert.equal(log.has('unknown'), false);
});

test('12. returns an empty array for unknown server', () => {
    const log = new EventLog();

    assert.deepEqual(log.getByServer('UNKNOWN'), []);
});

test('13. protects stored events from external mutation', () => {
    const log = new EventLog();

    const event = {
        eventId: 'A:1',
        serverId: 'A',
        sequence: 1,
        type: 'NICK_CHANGE',
        actorId: 'account-1',
        data: {
            oldNick: 'Ninni',
            newNick: 'Ninni1'
        }
    };

    log.add(event);

    event.data.newNick = 'Modified';

    assert.equal(
        log.get(event.eventId).data.newNick,
        'Ninni1'
    );
});

test('14. protects internal events from mutation through get()', () => {
    const log = new EventLog();
    const event = makeEvent();

    log.add(event);

    const retrieved = log.get(event.eventId);
    retrieved.data.newNick = 'Modified';

    assert.equal(
        log.get(event.eventId).data.newNick,
        'Ninni1'
    );
});

test('15. protects internal events from mutation through getAll()', () => {
    const log = new EventLog();

    log.add(makeEvent());

    const events = log.getAll();
    events[0].data.newNick = 'Modified';

    assert.equal(
        log.get('A:1').data.newNick,
        'Ninni1'
    );
});

test('16. rejects invalid event objects', () => {
    const log = new EventLog();

    assert.throws(
        () => log.add(null),
        /Invalid protocol event/
    );

    assert.throws(
        () => log.add({}),
        /Invalid protocol event/
    );
});

test('17. rejects invalid sequence numbers', () => {
    const log = new EventLog();

    for (const sequence of [0, -1, 1.5, NaN, Infinity]) {
        assert.throws(
            () => log.add({
                ...makeEvent(),
                sequence
            }),
            /Invalid protocol event/
        );
    }
});

test('18. rejects invalid missing sequence ranges', () => {
    const log = new EventLog();

    for (const sequence of [-1, 1.5, NaN, Infinity]) {
        assert.throws(
            () => log.getMissingSequences('A', sequence),
            /Invalid sequence range/
        );
    }
});

test('19. keeps histories of different servers separate', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 2));
    log.add(makeEvent('B', 1));
    log.add(makeEvent('B', 2));

    assert.equal(log.getByServer('A').length, 2);
    assert.equal(log.getByServer('B').length, 2);

    assert.deepEqual(
        log.getMissingSequences('A', 2),
        []
    );
});

test('20. reports the correct total event count', () => {
    const log = new EventLog();

    log.add(makeEvent('A', 1));
    log.add(makeEvent('A', 2));
    log.add(makeEvent('B', 1));

    assert.equal(log.size, 3);
    assert.equal(log.getAll().length, 3);
});
