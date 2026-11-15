// node src/tests/security/test-s2s-authorization-final.js
/*
S2S:n lopullinen valtuutuksen integraatiotesti meni kokonaan läpi.
Osa-alue	Tulos
Outbound ROUTE	16/16
Outbound SYNC	4/4
Control frame	1/1
Inbound ROUTE	16/16
Inbound SYNC	4/4
Trust revocation	5/5
ACK cleanup	1/1
Yhteensä	47/47

Mitä tämä nyt vahvistaa:
- ROUTE- ja SYNC-kehykset tarkistetaan molempiin suuntiin.
- Kielletyt oikeudet estävät lähetyksen tai vastaanoton.
- Luottamuksen poistaminen estää etäpalvelimen valtuutuksen.
- Aktiivinen yhteys sulkeutuu socketin kautta.
- Epäonnistunut lähetys siivoaa odottavan ACK:n.
*/
const assert = require('assert');

const {
    S2SConnection,
    STATES
} = require('../../s2s/connection/connection.js');

const TrustRegistry =
    require('../../s2s/security/trust-registry.js');

const {
    encodeFrame,
    TYPES
} = require('../../s2s/protocol/frame/frame.js');

const {
    authorizeAction
} = require('../../s2s/security');

const FRAME_ACTIONS = {
    [TYPES.CLIENT]: 'sync',
    [TYPES.CHANNEL_STATE]: 'sync',

    [TYPES.NICK]: 'route',
    [TYPES.JOIN]: 'route',
    [TYPES.PART]: 'route',
    [TYPES.QUIT]: 'route',
    [TYPES.MESSAGE]: 'route',
    [TYPES.NOTICE]: 'route',
    [TYPES.MODE]: 'route',
    [TYPES.TOPIC]: 'route'
};

const ROUTE_TYPES = [
    TYPES.NICK,
    TYPES.JOIN,
    TYPES.PART,
    TYPES.QUIT,
    TYPES.MESSAGE,
    TYPES.NOTICE,
    TYPES.MODE,
    TYPES.TOPIC
];

const SYNC_TYPES = [
    TYPES.CLIENT,
    TYPES.CHANNEL_STATE
];

let passed = 0;
let failed = 0;

function check(name, callback) {
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

function createSocket() {
    return {
        destroyed: false,
        writes: [],

        write(data) {
            this.writes.push(data);
            return true;
        },

        destroy() {
            this.destroyed = true;
        },

        on() {},
        once() {},
        removeListener() {},
        setNoDelay() {},
        setKeepAlive() {}
    };
}

function createFrame(type, sequence = 1n) {
    return encodeFrame({
        type,
        flags: 0,
        payload: Buffer.alloc(0),
        messageId: crypto.randomBytes(16),
        sequence
    });
}

const crypto = require('crypto');

function createConnection(
    permissions = {},
    policyOverrides = {}
) {
    const trustRegistry = new TrustRegistry();

    trustRegistry.addServer({
        serverId: 'remote-1',
        secret: 'test-secret',
        permissions: {
            connect: true,
            introduce: true,
            route: true,
            sync: true,
            ...permissions
        }
    });

    const socket = createSocket();

    const connection = new S2SConnection(socket, {
        serverId: 'local-1',
        serverName: 'local.test',
        trustRegistry,
        serverPolicy: {
            allowServerIntroduction: true,
            allowRouting: true,
            allowSynchronization: true,
            ...policyOverrides
        }
    });

    connection.state = STATES.CONNECTED;
    connection.remote.serverId = 'remote-1';

    return {
        connection,
        trustRegistry,
        socket
    };
}

function sendFrame(connection, type) {
    const messageId = crypto.randomBytes(16);
    const frame = createFrame(type);

    return connection.sendTrackedFrame(
        frame,
        messageId
    );
}

// --------------------------------------------------
// 1. REAL OUTBOUND SEND PATH
// --------------------------------------------------

console.log('\n=== REAL OUTBOUND SEND PATH ===');

for (const type of ROUTE_TYPES) {
    const { connection } = createConnection();

    check(
        `Outbound ROUTE 0x${type.toString(16)} allowed`,
        () => {
            assert.strictEqual(
                sendFrame(connection, type),
                true
            );
        }
    );
}

for (const type of ROUTE_TYPES) {
 const { connection } = createConnection(
    {},
    { allowRouting: false }
);

    check(
        `Outbound ROUTE 0x${type.toString(16)} denied`,
        () => {
            assert.strictEqual(
                sendFrame(connection, type),
                false
            );

            assert.strictEqual(
                connection.pendingAcks.size,
                0
            );
        }
    );
}

for (const type of SYNC_TYPES) {
    const { connection } = createConnection();

    check(
        `Outbound SYNC 0x${type.toString(16)} allowed`,
        () => {
            assert.strictEqual(
                sendFrame(connection, type),
                true
            );
        }
    );
}

for (const type of SYNC_TYPES) {
    const { connection } = createConnection(
        {},
        {
            allowSynchronization: false
        }
    );

    check(
        `Outbound SYNC 0x${type.toString(16)} denied`,
        () => {
            assert.strictEqual(
                sendFrame(connection, type),
                false
            );

            assert.strictEqual(
                connection.pendingAcks.size,
                0
            );
        }
    );
}

// --------------------------------------------------
// 2. CONTROL FRAME
// --------------------------------------------------

console.log('\n=== CONTROL FRAME ===');

{
    const { connection } = createConnection();

    check('Unknown tracked control frame is not misclassified', () => {
        const result = sendFrame(
            connection,
            TYPES.PING
        );

        assert.strictEqual(result, true);
    });
}

// --------------------------------------------------
// 3. INBOUND AUTHORIZATION
// --------------------------------------------------

console.log('\n=== INBOUND AUTHORIZATION ===');

for (const type of ROUTE_TYPES) {
    const { connection } = createConnection();

    check(
        `Inbound ROUTE 0x${type.toString(16)} allowed`,
        () => {
            const result = authorizeAction({
                connection,
                frameType: type
            });

            assert.strictEqual(
                result.authorized,
                true
            );

            assert.strictEqual(
                result.action,
                'route'
            );
        }
    );
}
for (const type of ROUTE_TYPES) {
    const { connection } = createConnection({
        route: false
    });

    check(
        `Inbound ROUTE 0x${type.toString(16)} denied`,
        () => {
            const result = authorizeAction({
                connection,
                frameType: type
            });

            assert.strictEqual(
                result.authorized,
                false
            );
        }
    );
}

for (const type of SYNC_TYPES) {
    const { connection } = createConnection();

    check(
        `Inbound SYNC 0x${type.toString(16)} allowed`,
        () => {
            const result = authorizeAction({
                connection,
                frameType: type
            });

            assert.strictEqual(
                result.authorized,
                true
            );

            assert.strictEqual(
                result.action,
                'sync'
            );
        }
    );
}

for (const type of SYNC_TYPES) {
    const { connection } = createConnection(
        {},
        {
            allowSynchronization: false
        }
    );

    check(
        `Inbound SYNC 0x${type.toString(16)} denied`,
        () => {
            const result = authorizeAction({
                connection,
                frameType: type
            });

            assert.strictEqual(
                result.authorized,
                false
            );
        }
    );
}

// --------------------------------------------------
// 4. ACTIVE TRUST REVOCATION
// --------------------------------------------------

console.log('\n=== ACTIVE TRUST REVOCATION ===');

{
    const { connection, trustRegistry, socket } =
        createConnection();

    check('Active connection begins CONNECTED', () => {
        assert.strictEqual(
            connection.state,
            STATES.CONNECTED
        );
    });

    check('Trust revocation removes remote server trust', () => {
        assert.strictEqual(
            trustRegistry.removeServer('remote-1'),
            true
        );

        assert.strictEqual(
            trustRegistry.isTrusted('remote-1'),
            false
        );
    });

    check('Revoked server cannot authorize ROUTE', () => {
        const result = authorizeAction({
            connection,
            frameType: TYPES.MESSAGE
        });

        assert.strictEqual(
            result.authorized,
            false
        );

        assert.strictEqual(
            result.reason,
            'SERVER_NOT_TRUSTED'
        );
    });

    check('Revoked server cannot authorize SYNC', () => {
        const result = authorizeAction({
            connection,
            frameType: TYPES.CLIENT
        });

        assert.strictEqual(
            result.authorized,
            false
        );
    });

connection.destroy();

check('Destroyed connection closes its socket', () => {
    assert.strictEqual(
        socket.destroyed,
        true
    );
});
}

// --------------------------------------------------
// 5. ACK CLEANUP
// --------------------------------------------------

console.log('\n=== ACK CLEANUP ===');

{
    const { connection } = createConnection();

    connection.sendFrame = () => false;

    check('Failed outbound send removes pending ACK', () => {
        const messageId = crypto.randomBytes(16);
        const frame = createFrame(TYPES.MESSAGE);

        const result = connection.sendTrackedFrame(
            frame,
            messageId
        );

        assert.strictEqual(result, false);

        assert.strictEqual(
            connection.pendingAcks.has(
                messageId.toString('hex')
            ),
            false
        );
    });
}

// --------------------------------------------------
// RESULT
// --------------------------------------------------

console.log('\n======================================');
console.log(
    `[RESULT] FINAL S2S AUTHORIZATION: ${passed}/${passed + failed}`
);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('======================================');

if (failed > 0) {
    process.exitCode = 1;
}
