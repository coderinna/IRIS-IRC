// node src/tests/test-security.js

const assert = require('assert');

const {
    TrustRegistry,
    createNetworkPolicy,
    createServerPolicy,
    authenticateServer,
    authorizeServer
} = require('../s2s/security');

// Trust registry
const trustRegistry = new TrustRegistry();

trustRegistry.addServer({
    serverId: 'iris-02',
    secret: 'test-secret',
    permissions: {
        connect: true,
        introduce: false,
        route: true,
        sync: true
    }
});

// Authentication
const auth = authenticateServer(
    trustRegistry,
    'iris-02',
    'test-secret'
);

assert.strictEqual(auth.authenticated, true);

const invalidAuth = authenticateServer(
    trustRegistry,
    'iris-02',
    'wrong-secret'
);

assert.strictEqual(invalidAuth.authenticated, false);

// Policies
const networkPolicy = createNetworkPolicy({
    allowedServerRoles: ['hub', 'leaf'],
    requiredCapabilities: ['multiserver']
});

const serverPolicy = createServerPolicy({
    allowedServerRoles: ['hub'],
    requiredCapabilities: ['multiserver']
});

// Authorization
const authorization = authorizeServer({
    trustRegistry,
    networkPolicy,
    serverPolicy,
    serverId: 'iris-02',
    server: {
        serverRole: 'hub',
        capabilities: ['multiserver'],
        tls: false
    }
});

assert.strictEqual(authorization.authorized, true);

// Reject disallowed role
const rejected = authorizeServer({
    trustRegistry,
    networkPolicy,
    serverPolicy,
    serverId: 'iris-02',
    server: {
        serverRole: 'leaf',
        capabilities: ['multiserver'],
        tls: false
    }
});

assert.strictEqual(rejected.authorized, false);

console.log('✓ S2S security tests passed');