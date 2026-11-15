// node src/tests/test-server-authorization.js

const assert = require('assert');

const authorizeServer = require('../../src/s2s/security/authorization/authorize-server');

const {
    createNetworkPolicy
} = require('../../src/s2s/security/policies/network-policy');

const {
    createServerPolicy
} = require('../../src/s2s/security/policies/server-policy');

const trustRegistry = {
    getServer: () => ({
        permissions: {
            connect: true,
            route: true,
            sync: true
        }
    })
};

function authorize({
    networkRoles = [],
    localRoles = [],
    serverRole = 'leaf'
} = {}) {
    return authorizeServer({
        trustRegistry,
        networkPolicy: createNetworkPolicy({
            allowedServerRoles: networkRoles
        }),
        serverPolicy: createServerPolicy({
            allowedServerRoles: localRoles
        }),
        serverId: 'remote-1',
        server: {
            serverRole,
            capabilities: [],
            tls: false
        }
    });
}

// 1. Molemmat politiikat sallivat palvelimen.
assert.strictEqual(
    authorize({
        networkRoles: ['hub', 'leaf'],
        localRoles: ['leaf']
    }).authorized,
    true
);

// 2. Verkkopolitiikka estää palvelimen.
assert.strictEqual(
    authorize({
        networkRoles: ['hub']
    }).reason,
    'NETWORK_ROLE_NOT_ALLOWED'
);

// 3. Paikallinen politiikka estää palvelimen.
assert.strictEqual(
    authorize({
        localRoles: ['hub']
    }).reason,
    'LOCAL_ROLE_NOT_ALLOWED'
);

// 4. Tyhjät roolilistat sallivat palvelimen.
assert.strictEqual(
    authorize({
        networkRoles: [],
        localRoles: []
    }).authorized,
    true
);

console.log('[PASS] Server authorization role tests: 4/4');
