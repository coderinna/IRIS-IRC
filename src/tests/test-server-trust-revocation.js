
const assert = require('assert');
const S2SManager = require('../s2s/manager/manager');

const manager = Object.create(S2SManager.prototype);

let destroyed = 0;

manager.trustRegistry = {
    removeServer(serverId) {
        return serverId === 'remote-1';
    }
};

const activeConnection = {
    remote: { serverId: 'remote-1' },
    destroy() {
        destroyed++;
    }
};

const unrelatedConnection = {
    remote: { serverId: 'remote-2' },
    destroy() {
        destroyed++;
    }
};

manager.connections = new Set([
    activeConnection,
    unrelatedConnection
]);

assert.strictEqual(
    manager.revokeServerTrust('remote-1'),
    true
);

assert.strictEqual(destroyed, 1);
assert.strictEqual(manager.connections.size, 2);

assert.strictEqual(
    manager.revokeServerTrust('unknown'),
    false
);

assert.strictEqual(destroyed, 1);

console.log('[PASS] Server trust revocation tests: 4/4');
