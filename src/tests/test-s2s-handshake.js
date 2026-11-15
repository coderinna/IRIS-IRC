
const assert = require('assert');

const handleHello = require('../s2s/connection/handlers/hello');
const handleAuth = require('../s2s/connection/handlers/auth');
const handleServer = require('../s2s/connection/handlers/server');
const handleReady = require('../s2s/connection/handlers/ready');

const { STATES } = require('../s2s/connection/states');

const TrustRegistry = require('../s2s/security/trust-registry');

const {
    createNetworkPolicy
} = require('../s2s/security/policies/network-policy');

const {
    createServerPolicy
} = require('../s2s/security/policies/server-policy');

const {
    FIELDS: HELLO_FIELDS
} = require('../s2s/messages/hello');

const {
    FIELDS: AUTH_FIELDS,
    METHODS
} = require('../s2s/messages/auth');

const {
    FIELDS: SERVER_FIELDS
} = require('../s2s/messages/server');

const {
    FIELDS: READY_FIELDS
} = require('../s2s/messages/ready');

const {
    encodeFields
} = require('../s2s/protocol/tlv/tlv');

const SERVER_ID = 'remote-1';
const SERVER_NAME = 'remote.iris.test';
const SERVER_SECRET = 'test-secret';

let passed = 0;
let failed = 0;


// --------------------------------------------------
// TEST RUNNER
// --------------------------------------------------

function test(name, callback) {
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


// --------------------------------------------------
// MOCK MANAGER
// --------------------------------------------------

function createManager() {
    return {
        activeServers: new Map(),

        registerRemoteServer(connection) {
            this.activeServers.set(
                connection.remote.serverId,
                connection
            );
        },

        getNetworkState() {
            return this.activeServers;
        }
    };
}


// --------------------------------------------------
// CONNECTION + TEST FRAMES
// --------------------------------------------------

function createConnection({
    networkRoles = ['hub', 'leaf'],
    localRoles = ['hub', 'leaf'],
    serverRole = 'leaf'
} = {}) {

    const trustRegistry = new TrustRegistry();

    trustRegistry.addServer({
        serverId: SERVER_ID,
        secret: SERVER_SECRET,
        permissions: {
            connect: true,
            introduce: true,
            route: true,
            sync: true
        }
    });

    const manager = createManager();

    const connection = {
        state: STATES.HELLO,

        remote: {
            serverId: null,
            serverName: null,
            capabilities: [],
            tls: false
        },

        trustRegistry,

        networkPolicy: createNetworkPolicy({
            allowedServerRoles: networkRoles
        }),

        serverPolicy: createServerPolicy({
            allowedServerRoles: localRoles
        }),

        manager,

        socket: {
            destroyed: false,

            destroy() {
                this.destroyed = true;
            }
        },

        authenticated: false,
        handshakeTimeout: null,

        sendAuth() {},
        sendServer() {},
        sendReady() {},

        syncClients() {},
        syncChannels() {},

        startHeartbeat() {},
        startPendingAckCleanup() {}
    };


    // HELLO

    const helloFrame = {
        payload: encodeFields([
            {
                type: HELLO_FIELDS.PROTOCOL_VERSION,
                value: Buffer.from([1])
            },
            {
                type: HELLO_FIELDS.SERVER_ID,
                value: SERVER_ID
            },
            {
                type: HELLO_FIELDS.SERVER_NAME,
                value: SERVER_NAME
            }
        ])
    };


    // AUTH

    const authFrame = {
        payload: encodeFields([
            {
                type: AUTH_FIELDS.AUTH_METHOD,
                value: METHODS.TOKEN
            },
            {
                type: AUTH_FIELDS.SERVER_ID,
                value: SERVER_ID
            },
            {
                type: AUTH_FIELDS.TOKEN,
                value: SERVER_SECRET
            }
        ])
    };


    // SERVER

    const serverFrame = {
        payload: encodeFields([
            {
                type: SERVER_FIELDS.SERVER_ID,
                value: SERVER_ID
            },
            {
                type: SERVER_FIELDS.SERVER_NAME,
                value: SERVER_NAME
            },
            {
                type: SERVER_FIELDS.SERVER_VERSION,
                value: 'iris-irc/0.1'
            },
            {
                type: SERVER_FIELDS.SERVER_ROLE,
                value: serverRole
            },
            {
                type: SERVER_FIELDS.HOP_COUNT,
                value: '0'
            }
        ])
    };


    // READY

    const readyFrame = {
        payload: encodeFields([
            {
                type: READY_FIELDS.STATUS,
                value: 'ready'
            },
            {
                type: READY_FIELDS.SERVER_ID,
                value: SERVER_ID
            }
        ])
    };


    return {
        connection,
        manager,

        frames: {
            helloFrame,
            authFrame,
            serverFrame,
            readyFrame
        }
    };
}


// --------------------------------------------------
// COMPLETE S2S HANDSHAKE
// --------------------------------------------------

function runHandshake(options = {}) {

    const {
        connection,
        manager,
        frames
    } = createConnection(options);


    // HELLO

    const hello = handleHello(
        connection,
        frames.helloFrame
    );

    assert.strictEqual(hello, true);

    assert.strictEqual(
        connection.state,
        STATES.AUTH
    );


    // AUTH

    const auth = handleAuth(
        connection,
        frames.authFrame
    );

    assert.strictEqual(auth, true);

    assert.strictEqual(
        connection.authenticated,
        true
    );

    assert.strictEqual(
        connection.state,
        STATES.SERVER
    );


    // SERVER

    const server = handleServer(
        connection,
        frames.serverFrame
    );

    assert.strictEqual(server, true);

    assert.strictEqual(
        connection.state,
        STATES.READY
    );


    // READY

    const ready = handleReady(
        connection,
        frames.readyFrame
    );


    return {
        ready,
        connection,
        manager
    };
}


// --------------------------------------------------
// TEST 1: AUTHORIZED SERVER
// --------------------------------------------------

test(
    'Authorized server completes S2S handshake and registers',
    () => {

        const result = runHandshake({
            serverRole: 'leaf',

            networkRoles: ['hub', 'leaf'],
            localRoles: ['hub', 'leaf']
        });


        assert.strictEqual(
            result.ready,
            true
        );

        assert.strictEqual(
            result.connection.state,
            STATES.CONNECTED
        );

        assert.strictEqual(
            result.connection.socket.destroyed,
            false
        );

        assert.strictEqual(
            result.manager.activeServers.size,
            1
        );

        assert.ok(
            result.manager.activeServers.has(SERVER_ID)
        );
    }
);


// --------------------------------------------------
// TEST 2: NETWORK POLICY REJECTS SERVER
// --------------------------------------------------

test(
    'Network policy rejects server and prevents registration',
    () => {

        const result = runHandshake({
            serverRole: 'leaf',

            networkRoles: ['hub'],
            localRoles: ['hub', 'leaf']
        });


        assert.strictEqual(
            result.ready,
            false
        );

        assert.strictEqual(
            result.connection.state,
            STATES.READY
        );

        assert.strictEqual(
            result.connection.socket.destroyed,
            true
        );

        assert.strictEqual(
            result.manager.activeServers.size,
            0
        );

        assert.ok(
            !result.manager.activeServers.has(SERVER_ID)
        );
    }
);


// --------------------------------------------------
// TEST 3: LOCAL POLICY REJECTS SERVER
// --------------------------------------------------

test(
    'Local policy rejects server and prevents registration',
    () => {

        const result = runHandshake({
            serverRole: 'hub',

            networkRoles: ['hub', 'leaf'],
            localRoles: ['leaf']
        });


        assert.strictEqual(
            result.ready,
            false
        );

        assert.strictEqual(
            result.connection.state,
            STATES.READY
        );

        assert.strictEqual(
            result.connection.socket.destroyed,
            true
        );

        assert.strictEqual(
            result.manager.activeServers.size,
            0
        );

        assert.ok(
            !result.manager.activeServers.has(SERVER_ID)
        );
    }
);


// --------------------------------------------------
// RESULTS
// --------------------------------------------------

console.log('');

console.log(
    `[RESULT] S2S handshake tests: ${passed}/${passed + failed}`
);

if (failed > 0) {
    process.exitCode = 1;
}
