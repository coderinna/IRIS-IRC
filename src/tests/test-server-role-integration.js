
const authorizeServer = require(
    '../s2s/security/authorization/authorize-server'
);

const TrustRegistry = require(
    '../s2s/security/trust-registry'
);

const {
    createNetworkPolicy
} = require('../s2s/security/policies/network-policy');

const {
    createServerPolicy
} = require('../s2s/security/policies/server-policy');

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

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function createFixture({
    networkRoles = ['HUB', 'LEAF'],
    localRoles = ['HUB', 'LEAF'],
    serverRole = 'LEAF',
    tls = false,
    requireTLS = false
} = {}) {
    const serverId = 'remote-1';
    const trustRegistry = new TrustRegistry();

    trustRegistry.addServer({
        serverId,
        secret: 'test-secret',
        permissions: {
            connect: true,
            introduce: true,
            route: true,
            sync: true
        }
    });

    const networkPolicy = createNetworkPolicy({
        allowedServerRoles: networkRoles,
        requiredCapabilities: [],
        requireTLS
    });

    const serverPolicy = createServerPolicy({
        allowedServerRoles: localRoles,
        requiredCapabilities: [],
        requireTLS
    });

    return authorizeServer({
        trustRegistry,
        networkPolicy,
        serverPolicy,
        serverId,
        server: {
            serverRole,
            capabilities: [],
            tls
        }
    });
}

test('Allowed HUB role is authorized', () => {
    const result = createFixture({ serverRole: 'HUB' });
    assert(result.authorized, JSON.stringify(result));
});

test('Allowed LEAF role is authorized', () => {
    const result = createFixture({ serverRole: 'LEAF' });
    assert(result.authorized, JSON.stringify(result));
});

test('Unknown role is rejected', () => {
    const result = createFixture({ serverRole: 'UNKNOWN' });
    assert(!result.authorized, JSON.stringify(result));
});

test('Network policy rejects unauthorized role', () => {
    const result = createFixture({
        serverRole: 'LEAF',
        networkRoles: ['HUB']
    });

    assert(
        !result.authorized &&
        result.reason === 'NETWORK_ROLE_NOT_ALLOWED',
        JSON.stringify(result)
    );
});

test('Local policy rejects unauthorized role', () => {
    const result = createFixture({
        serverRole: 'HUB',
        localRoles: ['LEAF']
    });

    assert(
        !result.authorized &&
        result.reason === 'LOCAL_ROLE_NOT_ALLOWED',
        JSON.stringify(result)
    );
});

test('Empty network role list allows server', () => {
    const result = createFixture({
        serverRole: 'HUB',
        networkRoles: []
    });

    assert(result.authorized, JSON.stringify(result));
});

test('Empty local role list allows server', () => {
    const result = createFixture({
        serverRole: 'LEAF',
        localRoles: []
    });

    assert(result.authorized, JSON.stringify(result));
});

test('TLS requirement rejects non-TLS server', () => {
    const result = createFixture({
        requireTLS: true,
        tls: false
    });

    assert(
        !result.authorized &&
        result.reason === 'NETWORK_REQUIRES_TLS',
        JSON.stringify(result)
    );
});

test('TLS requirement allows TLS server', () => {
    const result = createFixture({
        requireTLS: true,
        tls: true
    });

    assert(result.authorized, JSON.stringify(result));
});

console.log('');
console.log(
    `[RESULT] Server role integration tests: ${passed}/${passed + failed}`
);

if (failed > 0) {
    process.exitCode = 1;
}
