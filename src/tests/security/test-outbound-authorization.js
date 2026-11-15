
const assert = require('assert');

const {
    validateOutgoingFrame
} = require('../../s2s/connection/outbound-validation');

const {
    encodeFrame,
    TYPES
} = require('../../s2s/protocol/frame/frame');

const {
    STATES
} = require('../../s2s/connection/states');

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
let failed = 0;

function test(name, callback) {
    try {
        callback();
        passed++;
        console.log(`[PASS] ${name}`);
    } catch (error) {
        failed++;
        console.error(`[FAIL] ${name}`);
        console.error(error.message);
    }
}

function testOutboundAction(type, action, permission) {
    connection.serverPolicy[permission] = true;

    test(
        `Outbound ${action.toUpperCase()} allows frame 0x${type.toString(16)}`,
        () => {
            assert.strictEqual(
                validateOutgoingFrame(
                    connection,
                    createFrame(type),
                    action
                ),
                true
            );
        }
    );

    connection.serverPolicy[permission] = false;

    test(
        `Outbound ${action.toUpperCase()} denies frame 0x${type.toString(16)}`,
        () => {
            assert.strictEqual(
                validateOutgoingFrame(
                    connection,
                    createFrame(type),
                    action
                ),
                false
            );
        }
    );

    connection.serverPolicy[permission] = true;
}

// --------------------------------------------------
// INTRODUCTION
// --------------------------------------------------

console.log('\n=== OUTBOUND INTRODUCTION ===');

testOutboundAction(
    TYPES.SERVER,
    'introduce',
    'allowServerIntroduction'
);

// --------------------------------------------------
// ROUTE
// --------------------------------------------------

console.log('\n=== OUTBOUND ROUTE ===');

const routeFrames = [
    TYPES.MESSAGE,
    TYPES.NOTICE,
    TYPES.JOIN,
    TYPES.PART,
    TYPES.QUIT,
    TYPES.NICK,
    TYPES.MODE,
    TYPES.TOPIC
];

for (const type of routeFrames) {
    testOutboundAction(
        type,
        'route',
        'allowRouting'
    );
}

// --------------------------------------------------
// SYNC
// --------------------------------------------------

console.log('\n=== OUTBOUND SYNC ===');

const syncFrames = [
    TYPES.CLIENT,
    TYPES.CHANNEL_STATE
];

for (const type of syncFrames) {
    testOutboundAction(
        type,
        'sync',
        'allowSynchronization'
    );
}

// --------------------------------------------------
// NORMAL CONTROL TRAFFIC
// --------------------------------------------------

console.log('\n=== CONTROL FRAMES ===');

test('Normal outbound PING without action', () => {
    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.PING)
        ),
        true
    );
});

// --------------------------------------------------
// MISSING POLICY
// --------------------------------------------------

console.log('\n=== POLICY VALIDATION ===');

test('Missing server policy denies authorized action', () => {
    const originalPolicy = connection.serverPolicy;

    connection.serverPolicy = null;

    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.MESSAGE),
            'route'
        ),
        false
    );

    connection.serverPolicy = originalPolicy;
});

// --------------------------------------------------
// UNSUPPORTED ACTION
// --------------------------------------------------

test('Unsupported outbound action is denied', () => {
    assert.strictEqual(
        validateOutgoingFrame(
            connection,
            createFrame(TYPES.MESSAGE),
            'unknown'
        ),
        false
    );
});

// --------------------------------------------------
// RESULT
// --------------------------------------------------

console.log('\n====================================');
console.log(
    `[RESULT] Outbound authorization tests: ${passed}/${passed + failed}`
);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('====================================');

if (failed > 0) {
    process.exitCode = 1;
}
