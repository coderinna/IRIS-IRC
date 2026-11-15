
const assert = require('assert');

const propagateServer =
    require('../../src/s2s/manager/server/propagateServer');

const {
    STATES
} = require('../../src/s2s/connection/states');

let passed = 0;

function test(name, callback) {
    try {
        callback();
        passed++;
        console.log(`[PASS] ${name}`);
    } catch (error) {
        console.error(`[FAIL] ${name}`);
        console.error(error);
        process.exitCode = 1;
    }
}

function createManager(sendResult) {
    const calls = [];

    const connection = {
        state: STATES.CONNECTED,
        remote: {
            serverId: 'remote-1'
        },

        sendServer(data, action) {
            calls.push({ data, action });
            return sendResult;
        }
    };

    return {
        manager: {
            serverId: 'local-1',
            connections: new Set([connection])
        },
        calls
    };
}

const server = {
    serverId: 'new-server',
    serverName: 'new.example',
    serverVersion: '1.0.0',
    role: 'hub',
    hopCount: 1
};

test('Successful propagation increments count', () => {
    const { manager, calls } = createManager(true);

    const result = propagateServer(manager, server);

    assert.strictEqual(result, 1);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].action, 'introduce');
});

test('Denied propagation does not increment count', () => {
    const { manager, calls } = createManager(false);

    const result = propagateServer(manager, server);

    assert.strictEqual(result, 0);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].action, 'introduce');
});

console.log(
    `\n[RESULT] Server propagation tests: ${passed}/2`
);

if (passed !== 2) {
    process.exitCode = 1;
}
