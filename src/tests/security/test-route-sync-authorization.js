
const authorizeOutbound = require(
    '../../s2s/security/authorization/authorize-outbound'
);

let passed = 0;
let failed = 0;

function test(name, callback) {
    try {
        callback();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (error) {
        console.error(`[FAIL] ${name}`);
        console.error(error.message);
        failed++;
    }
}

function assertAuthorized(result, expected) {
    if (result.authorized !== expected) {
        throw new Error(
            `Expected authorized=${expected}, received ${result.authorized}`
        );
    }
}

const policies = {
    allowServerIntroduction: true,
    allowRouting: true,
    allowSynchronization: true
};

// ROUTE

test('ROUTE: allowed when routing is enabled', () => {
    const result = authorizeOutbound({
        serverPolicy: policies,
        action: 'route'
    });

    assertAuthorized(result, true);
});

test('ROUTE: denied when routing is disabled', () => {
    const result = authorizeOutbound({
        serverPolicy: {
            ...policies,
            allowRouting: false
        },
        action: 'route'
    });

    assertAuthorized(result, false);
});

// SYNC

test('SYNC: allowed when synchronization is enabled', () => {
    const result = authorizeOutbound({
        serverPolicy: policies,
        action: 'sync'
    });

    assertAuthorized(result, true);
});

test('SYNC: denied when synchronization is disabled', () => {
    const result = authorizeOutbound({
        serverPolicy: {
            ...policies,
            allowSynchronization: false
        },
        action: 'sync'
    });

    assertAuthorized(result, false);
});

// INVALID ACTION

test('Unknown action is denied', () => {
    const result = authorizeOutbound({
        serverPolicy: policies,
        action: 'unknown'
    });

    assertAuthorized(result, false);
});

// MISSING POLICY

test('Missing server policy is denied', () => {
    const result = authorizeOutbound({
        serverPolicy: null,
        action: 'route'
    });

    assertAuthorized(result, false);
});

console.log('');
console.log(
    `[RESULT] Route/Sync authorization tests: ${passed}/${passed + failed}`
);

if (failed > 0) {
    process.exitCode = 1;
}
