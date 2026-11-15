
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

let passed = 0;
let failed = 0;

function readSource(file) {
    const fullPath = path.join(ROOT, file);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Source file missing: ${file}`);
    }

    return fs.readFileSync(fullPath, 'utf8');
}

function test(name, callback) {
    try {
        callback();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (error) {
        console.log(`[FAIL] ${name}`);
        console.log(`       ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const connection = readSource(
    'src/s2s/connection/connection.js'
);

const authorizeAction = readSource(
    'src/s2s/security/authorization/authorize-action.js'
);

const outboundValidation = readSource(
    'src/s2s/connection/outbound-validation/index.js'
);

const authorizeOutbound = readSource(
    'src/s2s/security/authorization/authorize-outbound.js'
);

// --------------------------------------------------
// INBOUND AUTHORIZATION
// --------------------------------------------------

console.log('\n=== INBOUND AUTHORIZATION ===');

test('Connection imports authorizeAction from security module', () => {
    assert(
        /require\(['"]\.\.\/security['"]\)/.test(connection) &&
        /authorizeAction/.test(connection),
        'authorizeAction import from security module not found'
    );
});

test('Connection calls authorizeAction during frame processing', () => {
    assert(
        /authorizeAction\s*\(\s*\{/.test(connection),
        'authorizeAction invocation not found'
    );
});

test('Unauthorized frames are rejected before handler execution', () => {
    const authorizationIndex =
        connection.indexOf('authorizeAction');

    const rejectionIndex =
        connection.indexOf('if (!authorization.authorized)');

    const handlerIndex =
        connection.indexOf('handler(frame)');

    assert(
        authorizationIndex !== -1 &&
        rejectionIndex > authorizationIndex &&
        handlerIndex > rejectionIndex,
        'Authorization must happen before handler(frame)'
    );

    const rejectionBlock = connection.slice(
        rejectionIndex,
        handlerIndex
    );

    assert(
        /return\s*;/.test(rejectionBlock),
        'Unauthorized frame path must return before handler'
    );
});

// --------------------------------------------------
// ROUTE FRAME COVERAGE
// --------------------------------------------------

console.log('\n=== ROUTE FRAME COVERAGE ===');

const routeFrames = [
    0x11,
    0x12,
    0x13,
    0x14,
    0x15,
    0x16,
    0x18,
    0x19
];

for (const frameType of routeFrames) {
    test(
        `ROUTE frame 0x${frameType.toString(16)} has authorization mapping`,
        () => {
            const pattern = new RegExp(
                `\\[\\s*0x${frameType.toString(16)}\\s*\\]\\s*:\\s*['"]route['"]`
            );

            assert(
                pattern.test(authorizeAction),
                'ROUTE authorization mapping missing'
            );
        }
    );
}

// --------------------------------------------------
// SYNC FRAME COVERAGE
// --------------------------------------------------

console.log('\n=== SYNC FRAME COVERAGE ===');

for (const frameType of [0x10, 0x17]) {
    test(
        `SYNC frame 0x${frameType.toString(16)} has authorization mapping`,
        () => {
            const pattern = new RegExp(
                `\\[\\s*0x${frameType.toString(16)}\\s*\\]\\s*:\\s*['"]sync['"]`
            );

            assert(
                pattern.test(authorizeAction),
                'SYNC authorization mapping missing'
            );
        }
    );
}

// --------------------------------------------------
// OUTBOUND AUTHORIZATION
// --------------------------------------------------

console.log('\n=== OUTBOUND AUTHORIZATION ===');

test('Outbound validation imports authorizeOutbound', () => {
    assert(
        /require\([^)]*authorize-outbound/.test(outboundValidation),
        'authorizeOutbound import not found'
    );
});

test('Outbound validation calls authorizeOutbound', () => {
    assert(
        /authorizeOutbound\s*\(/.test(outboundValidation),
        'authorizeOutbound invocation not found'
    );
});

test('Outbound authorization checks ROUTE permission', () => {
    assert(
        /route/.test(authorizeOutbound),
        'ROUTE permission handling not found'
    );
});

test('Outbound authorization checks SYNC permission', () => {
    assert(
        /sync/.test(authorizeOutbound),
        'SYNC permission handling not found'
    );
});

// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log('\n====================================');
console.log(
    `[RESULT] Production authorization coverage: ${passed}/${passed + failed}`
);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('====================================');

process.exitCode = failed > 0 ? 1 : 0;
