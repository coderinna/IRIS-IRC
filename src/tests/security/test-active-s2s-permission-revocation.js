
const EventEmitter = require('events');

const S2SManager = require(
    '../../../src/s2s/manager/manager.js'
);

const TrustRegistry = require(
    '../../../src/s2s/security/trust-registry.js'
);

const authorizeAction = require(
    '../../../src/s2s/security/authorization/authorize-action.js'
);

const {
    S2SConnection,
    STATES
} = require(
    '../../../src/s2s/connection/connection.js'
);

const TYPES = {
    SYNC: 0x10,

    ROUTE_MESSAGE: 0x11,
    ROUTE_NOTICE: 0x12,
    ROUTE_JOIN: 0x13,
    ROUTE_PART: 0x14,
    ROUTE_QUIT: 0x15,
    ROUTE_NICK: 0x16,
    ROUTE_MODE: 0x18,
    ROUTE_TOPIC: 0x19
};

const ROUTE_TYPES = [
    TYPES.ROUTE_MESSAGE,
    TYPES.ROUTE_NOTICE,
    TYPES.ROUTE_JOIN,
    TYPES.ROUTE_PART,
    TYPES.ROUTE_QUIT,
    TYPES.ROUTE_NICK,
    TYPES.ROUTE_MODE,
    TYPES.ROUTE_TOPIC
];

let passed = 0;
let failed = 0;

function check(name, callback) {
    try {
        callback();

        console.log(`[PASS] ${name}`);
        passed++;
    } catch (error) {
        console.error(`[FAIL] ${name}`);
        console.error(error.stack || error.message);

        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

/*
 * ------------------------------------------------------------
 * TEST SOCKET
 * ------------------------------------------------------------
 */

class TestSocket extends EventEmitter {
    constructor() {
        super();

        this.destroyed = false;
        this.writable = true;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.writable = false;

        this.emit('close');
    }

    write() {
        if (this.destroyed) {
            return false;
        }

        return true;
    }

    end() {
        this.destroy();
    }
}

/*
 * ------------------------------------------------------------
 * TRUST REGISTRY
 * ------------------------------------------------------------
 */

const trustRegistry = new TrustRegistry();

trustRegistry.addServer({
    serverId: 'remote-1',
    secret: 'test-secret',

    permissions: {
        connect: true,
        introduce: true,
        route: true,
        sync: true
    }
});

/*
 * ------------------------------------------------------------
 * REMOTE SERVER
 * ------------------------------------------------------------
 */

const remoteServer = {
    serverId: 'remote-1',
    connection: null,
    status: 'online'
};

/*
 * ------------------------------------------------------------
 * NETWORK MANAGER
 * ------------------------------------------------------------
 */

const networkManager = {
    getClients() {
        return [];
    },

    removeClientsByConnection(connection) {
        return 0;
    },

    getServer(serverId) {
        return serverId === 'remote-1'
            ? remoteServer
            : null;
    },

    setConnection(serverId, connection) {
        if (serverId === 'remote-1') {
            remoteServer.connection = connection;
        }
    },

    setStatus(serverId, status) {
        if (serverId === 'remote-1') {
            remoteServer.status = status;
        }
    }
};

/*
 * ------------------------------------------------------------
 * S2S MANAGER
 * ------------------------------------------------------------
 */

const manager = new S2SManager({
    serverId: 'local-1',
    serverName: 'local.iris.test',

    networkManager,

    getLocalClientByNick() {
        return null;
    },

    getLocalClientById() {
        return null;
    },

    getLocalChannels() {
        return [];
    },

    trustRegistry
});

/*
 * ------------------------------------------------------------
 * REAL S2S CONNECTION
 * ------------------------------------------------------------
 */

const socket = new TestSocket();

const connection = new S2SConnection(socket, {
    manager,
    trustRegistry,

    serverId: 'local-1',
    serverName: 'local.iris.test'
});

connection.remote = {
    serverId: 'remote-1',
    serverName: 'remote.iris.test',
    serverVersion: 'iris-test',
    serverRole: 'hub',
    capabilities: []
};

connection.state = STATES.CONNECTED;

remoteServer.connection = connection;

manager.addConnection(connection);

/*
 * ------------------------------------------------------------
 * AUTHORIZATION HELPER
 * ------------------------------------------------------------
 */

function authorize(frameType) {
    return authorizeAction({
        connection,
        frameType
    });
}

/*
 * ------------------------------------------------------------
 * 1. ACTIVE CONNECTION
 * ------------------------------------------------------------
 */

check(
    'Real S2S connection is registered and CONNECTED',
    () => {
        assert(
            manager.connections.has(connection),
            'Connection is missing from manager'
        );

        assert(
            connection.state === STATES.CONNECTED,
            `Expected CONNECTED, got ${connection.state}`
        );

        assert(
            socket.destroyed === false,
            'Socket is already destroyed'
        );

        assert(
            remoteServer.connection === connection,
            'Remote server does not reference active connection'
        );
    }
);

/*
 * ------------------------------------------------------------
 * 2. ROUTE PERMISSION BEFORE REVOCATION
 * ------------------------------------------------------------
 */

for (const frameType of ROUTE_TYPES) {
    check(
        `Active connection allows ROUTE 0x${frameType.toString(16)}`,
        () => {
            const result = authorize(frameType);

            assert(
                result.authorized === true,
                JSON.stringify(result)
            );

            assert(
                result.action === 'route',
                JSON.stringify(result)
            );
        }
    );
}

/*
 * ------------------------------------------------------------
 * 3. SYNC PERMISSION BEFORE REVOCATION
 * ------------------------------------------------------------
 */

check(
    'Active connection allows SYNC',
    () => {
        const result = authorize(TYPES.SYNC);

        assert(
            result.authorized === true,
            JSON.stringify(result)
        );

        assert(
            result.action === 'sync',
            JSON.stringify(result)
        );
    }
);

/*
 * ------------------------------------------------------------
 * 4. REVOKE THROUGH PRODUCTION MANAGER
 * ------------------------------------------------------------
 */

check(
    'Manager revokes remote server trust',
    () => {
        const result =
            manager.revokeServerTrust('remote-1');

        assert(
            result === true,
            `Expected true, got ${result}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 5. TRUST REGISTRY
 * ------------------------------------------------------------
 */

check(
    'Remote server is removed from TrustRegistry',
    () => {
        assert(
            trustRegistry.getServer('remote-1') === null,
            'Remote server is still trusted'
        );
    }
);

/*
 * ------------------------------------------------------------
 * 6. ACTIVE CONNECTION DESTRUCTION
 * ------------------------------------------------------------
 */

check(
    'Manager destroys the real active S2S connection',
    () => {
        assert(
            socket.destroyed === true,
            'Production connection did not destroy its socket'
        );

        assert(
            connection.state === STATES.CLOSED,
            `Expected CLOSED, got ${connection.state}`
        );

        assert(
            !manager.connections.has(connection),
            'Closed connection remains registered in manager'
        );
    }
);

/*
 * ------------------------------------------------------------
 * 7. REMOTE SERVER UNREGISTRATION
 * ------------------------------------------------------------
 */

check(
    'Remote server connection is removed',
    () => {
        assert(
            remoteServer.connection === null,
            'Remote server still references the closed connection'
        );

        assert(
            remoteServer.status === 'offline',
            `Expected offline, got ${remoteServer.status}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 8. ROUTE OPERATIONS AFTER REVOCATION
 * ------------------------------------------------------------
 */

for (const frameType of ROUTE_TYPES) {
    check(
        `Revoked connection denies ROUTE 0x${frameType.toString(16)}`,
        () => {
            const result = authorize(frameType);

            assert(
                result.authorized === false,
                `ROUTE was unexpectedly authorized: ${JSON.stringify(result)}`
            );
        }
    );
}

/*
 * ------------------------------------------------------------
 * 9. SYNC AFTER REVOCATION
 * ------------------------------------------------------------
 */

check(
    'Revoked connection denies SYNC',
    () => {
        const result = authorize(TYPES.SYNC);

        assert(
            result.authorized === false,
            `SYNC was unexpectedly authorized: ${JSON.stringify(result)}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 10. CONNECTION REMAINS CLOSED
 * ------------------------------------------------------------
 */

check(
    'Revoked connection remains CLOSED',
    () => {
        assert(
            connection.state === STATES.CLOSED,
            `Connection unexpectedly became ${connection.state}`
        );

        assert(
            socket.destroyed === true,
            'Socket unexpectedly became active again'
        );
    }
);

/*
 * ------------------------------------------------------------
 * RESULT
 * ------------------------------------------------------------
 */

console.log('');

console.log(
    `[RESULT] Active S2S permission revocation: ` +
    `${passed}/${passed + failed}`
);

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
    process.exitCode = 1;
}
