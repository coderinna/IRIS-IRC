const test = require('node:test');
const assert = require('node:assert/strict');

const EventLog = require('../event-log');

test('EventLog stores a new event', () => {
    const log = new EventLog();

    const event = {
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1,
        type: 'NICK',
        payload: { nick: 'Ninni' }
    };

    assert.equal(log.add(event), true);
    assert.equal(log.size, 1);
    assert.deepEqual(log.get('server-a', '001'), event);
});

test('EventLog rejects duplicate events', () => {
    const log = new EventLog();
    const event = {
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    };

    assert.equal(log.add(event), true);
    assert.equal(log.add(event), false);
});

test('Different servers can use the same eventId and sequence', () => {
    const log = new EventLog();

    assert.equal(log.add({
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    }), true);

    assert.equal(log.add({
        originServerId: 'server-b',
        eventId: '001',
        sequence: 1
    }), true);

    assert.equal(log.size, 2);
});

test('EventLog detects missing sequences', () => {
    const log = new EventLog();

    log.add({
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    });

    log.add({
        originServerId: 'server-a',
        eventId: '003',
        sequence: 3
    });

    assert.deepEqual(
        log.getMissingSequences('server-a', 3),
        [2]
    );
});

test('EventLog detects multiple missing sequences', () => {
    const log = new EventLog();

    log.add({
        originServerId: 'server-a',
        eventId: '002',
        sequence: 2
    });

    log.add({
        originServerId: 'server-a',
        eventId: '005',
        sequence: 5
    });

    assert.deepEqual(
        log.getMissingSequences('server-a', 5),
        [1, 3, 4]
    );
});

test('EventLog accepts out-of-order events', () => {
    const log = new EventLog();

    assert.equal(log.add({
        originServerId: 'server-a',
        eventId: '002',
        sequence: 2
    }), true);

    assert.equal(log.add({
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    }), true);

    assert.deepEqual(
        log.getMissingSequences('server-a', 2),
        []
    );
});

test('EventLog rejects conflicting sequence numbers', () => {
    const log = new EventLog();

    log.add({
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    });

    assert.throws(() => {
        log.add({
            originServerId: 'server-a',
            eventId: '002',
            sequence: 1
        });
    }, /Sequence number conflict/);
});

test('EventLog rejects invalid sequence numbers', () => {
    const log = new EventLog();

    assert.throws(() => {
        log.add({
            originServerId: 'server-a',
            eventId: '001',
            sequence: 0
        });
    }, /Invalid recovery event/);
});

test('EventLog returns null for unknown events', () => {
    const log = new EventLog();

    assert.equal(log.get('server-a', 'unknown'), null);
});

test('EventLog returns all stored events', () => {
    const log = new EventLog();

    log.add({
        originServerId: 'server-a',
        eventId: '001',
        sequence: 1
    });

    log.add({
        originServerId: 'server-b',
        eventId: '001',
        sequence: 1
    });

    assert.equal(log.getAll().length, 2);
});