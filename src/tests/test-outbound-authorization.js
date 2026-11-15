
const assert = require('assert');

const {
    validateOutgoingFrame
} = require('../s2s/connection/outbound-validation');

const {
    encodeFrame
} = require('../s2s/protocol/frame/frame');

const {
    TYPES
} = require('../s2s/protocol/frame/frame');

const {
    STATES
} = require('../s2s/connection/states');

function createFrame(type) {
    return encodeFrame({
        type,
        sequence: 1n,
        messageId: Buffer.alloc(16, 1),
        payload: Buffer.alloc(0)
    });
}

const connection = {
    state: STATES.CONNECTED,

    serverPolicy: {
        allowServerIntroduction: true,
        allowRouting: true,
        allowSynchronization: true
    }
};

let passed = 0;

function test(name, callback) {
    try {
        callback();
        passed++;
        console.log(`[PASS] ${name}`);
    } catch (error) {
        console.error(`[FAIL] ${name}`);
        console.error(error.message);
        process.exitCode = 1;
    }
}

// 1. Introduction sallitaan.
test('Allowed outbound introduction', () => {
    connection.serverPolicy.allowServerIntroduction = true;

    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.SERVER),
            'introduce'
        ),
        true
    );
});

// 2. Introduction estetään.
test('Denied outbound introduction', () => {
    connection.serverPolicy.allowServerIntroduction = false;

    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.SERVER),
            'introduce'
        ),
        false
    );
});

// 3. Tavallinen liikenne ilman action-parametria toimii.
test('Normal outbound frame without action', () => {
    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.PING)
        ),
        true
    );
});

console.log(
    `\n[RESULT] Outbound authorization tests: ${passed}/3`
);

if (passed !== 3) {
    process.exitCode = 1;
}
