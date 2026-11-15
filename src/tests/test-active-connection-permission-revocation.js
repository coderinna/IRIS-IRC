
const authorizeAction = require(
    '../s2s/security/authorization/authorize-action'
);

const { STATES } = require(
    '../s2s/connection/states.js'
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

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const remoteServer = {
    serverId: 'remote-1',
    permissions: {
        connect: true,
        introduce: true,
        route: true,
        sync: true
    }
};

const connection = {
    state: STATES.CONNECTED,

    remote: {
        serverId: 'remote-1'
    },

    trustRegistry: {
        getServer(serverId) {
            return serverId === remoteServer.serverId
                ? remoteServer
                : null;
        }
    },

    serverPolicy: {
        allowServerIntroduction: true,
        allowRouting: true,
        allowSynchronization: true
    }
};

function authorize(frameType) {
    return authorizeAction({
        connection,
        frameType
    });
}

// ROUTE

test('Active connection initially allows ROUTE', () => {
    const result = authorize(0x11);

    assert(result.authorized === true, JSON.stringify(result));
});

test('Removing ROUTE permission denies next action', () => {
    remoteServer.permissions.route = false;

    const result = authorize(0x11);

    assert(result.authorized === false, JSON.stringify(result));
});

test('ROUTE revocation does not disconnect connection', () => {
    assert(
        connection.state === STATES.CONNECTED,
        'Connection should remain connected'
    );
});

// SYNC

test('Active connection initially allows SYNC', () => {
    const result = authorize(0x10);

    assert(result.authorized === true, JSON.stringify(result));
});

test('Removing SYNC permission denies next action', () => {
    remoteServer.permissions.sync = false;

    const result = authorize(0x10);

    assert(result.authorized === false, JSON.stringify(result));
});

test('SYNC revocation does not disconnect connection', () => {
    assert(
        connection.state === STATES.CONNECTED,
        'Connection should remain connected'
    );
});

console.log('');

console.log(
    `[RESULT] Active connection permission revocation tests: ${passed}/${passed + failed}`
);

if (failed > 0) {
    process.exitCode = 1;
}
