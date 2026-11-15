const test = require('node:test');
const assert = require('node:assert/strict');

const EventLog = require('../event-log');
const RecoveryManager = require('../recovery-manager');

test('RecoveryManager creates a request for missing events', () => {
    const log = new EventLog();
    const manager = new RecoveryManager(log);

    log.add({
        originServerId: 'server-a',
        eventId: 'event-1',
        sequence: 1
    });

    log.add({
        originServerId: 'server-a',
        eventId: 'event-3',
        sequence: 3
    });

    assert.deepEqual(
        manager.createRecoveryRequest('server-a', 3),
        {
            type: 'RECOVERY_REQUEST',
            originServerId: 'server-a',
            missingSequences: [2]
        }
    );
});

test('RecoveryManager returns empty request when nothing is missing', () => {
    const manager = new RecoveryManager(new EventLog());

    assert.deepEqual(
        manager.createRecoveryRequest('server-a', 0),
        {
            type: 'RECOVERY_REQUEST',
            originServerId: 'server-a',
            missingSequences: []
        }
    );
});

test('RecoveryManager accepts recovered events', () => {
    const log = new EventLog();
    const manager = new RecoveryManager(log);

    const result = manager.acceptRecoveryEvents([
        {
            originServerId: 'server-a',
            eventId: 'event-1',
            sequence: 1
        },
        {
            originServerId: 'server-a',
            eventId: 'event-2',
            sequence: 2
        }
    ]);

    assert.deepEqual(result, {
        accepted: 2,
        duplicates: 0
    });

    assert.equal(log.size, 2);
});

test('RecoveryManager counts duplicate recovered events', () => {
    const log = new EventLog();
    const manager = new RecoveryManager(log);

    const event = {
        originServerId: 'server-a',
        eventId: 'event-1',
        sequence: 1
    };

    manager.acceptRecoveryEvents([event]);

    assert.deepEqual(
        manager.acceptRecoveryEvents([event]),
        {
            accepted: 0,
            duplicates: 1
        }
    );
});

test('RecoveryManager rejects invalid event collections', () => {
    const manager = new RecoveryManager(new EventLog());

    assert.throws(() => {
        manager.acceptRecoveryEvents('not-an-array');
    }, /must be an array/);
});

test('RecoveryManager rejects invalid request parameters', () => {
    const manager = new RecoveryManager(new EventLog());

    assert.throws(() => {
        manager.createRecoveryRequest('', 5);
    }, /Invalid recovery request parameters/);
});

test('RecoveryManager returns requested events', () => {
    const log = new EventLog();
    const manager = new RecoveryManager(log);

    log.add({
        originServerId: 'server-a',
        eventId: 'event-1',
        sequence: 1
    });

    log.add({
        originServerId: 'server-a',
        eventId: 'event-2',
        sequence: 2
    });

    const response = manager.createRecoveryResponse({
        type: 'RECOVERY_REQUEST',
        originServerId: 'server-a',
        missingSequences: [2]
    });

    assert.equal(response.type, 'RECOVERY_RESPONSE');
    assert.equal(response.events.length, 1);
    assert.equal(response.events[0].sequence, 2);
    assert.deepEqual(response.unavailableSequences, []);
});

test('RecoveryManager reports unavailable events', () => {
    const manager = new RecoveryManager(new EventLog());

    const response = manager.createRecoveryResponse({
        type: 'RECOVERY_REQUEST',
        originServerId: 'server-a',
        missingSequences: [3, 4]
    });

    assert.equal(response.events.length, 0);
    assert.deepEqual(response.unavailableSequences, [3, 4]);
});

test('RecoveryManager does not return duplicate requested events', () => {
    const log = new EventLog();
    const manager = new RecoveryManager(log);

    log.add({
        originServerId: 'server-a',
        eventId: 'event-1',
        sequence: 1
    });

    const response = manager.createRecoveryResponse({
        type: 'RECOVERY_REQUEST',
        originServerId: 'server-a',
        missingSequences: [1, 1]
    });

    assert.equal(response.events.length, 1);
});

test('RecoveryManager rejects invalid recovery requests', () => {
    const manager = new RecoveryManager(new EventLog());

    assert.throws(() => {
        manager.createRecoveryResponse({
            type: 'INVALID',
            originServerId: 'server-a',
            missingSequences: [1]
        });
    }, /Invalid recovery request/);
});