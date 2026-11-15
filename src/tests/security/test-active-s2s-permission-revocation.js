// src/tests/security/test-active-s2s-permission-revocation.js
/*
aktiivisen S2S-yhteyden revokaatio toimii nyt oikeasti managerin, TrustRegistryn ja authorization-kerroksen läpi:
- ✅ kaikki 8 ROUTE-framea sallitaan ennen revokaatiota
- ✅ SYNC sallitaan ennen revokaatiota
- ✅ revokeServerTrust() onnistuu
- ✅ palvelin poistuu TrustRegistry:stä
- ✅ aktiivinen yhteys tuhotaan
- ✅ kaikki ROUTE-operaatiot estetään revokaation jälkeen
- ✅ SYNC estetään
- ✅ yhteys jää CLOSED-tilaan
*/
const S2SManager = require(
    '../../../src/s2s/manager/manager.js'
);

const TrustRegistry = require(
    '../../../src/s2s/security/trust-registry.js'
);

const authorizeAction = require(
    '../../../src/s2s/security/authorization/authorize-action.js'
);

const { STATES } = require(
    '../../../src/s2s/connection/states.js'
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
 * S2S MANAGER
 * ------------------------------------------------------------
 */

const manager = new S2SManager({
    serverId: 'local-1',
    serverName: 'local.iris.test',

    networkManager: {
        getClients() {
            return [];
        }
    },

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
 * ACTIVE S2S CONNECTION
 * ------------------------------------------------------------
 */

let destroyed = false;

const connection = {
    state: STATES.CONNECTED,

    remote: {
        serverId: 'remote-1'
    },

    /*
     * Nämä ovat samat valtuutusasetukset,
     * joita authorizeAction() odottaa.
     */
    trustRegistry,

    serverPolicy: {
        allowServerIntroduction: true,
        allowRouting: true,
        allowSynchronization: true
    },

    destroy() {
        destroyed = true;
        this.state = STATES.CLOSED;
    }
};

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

test(
    'Active S2S connection starts CONNECTED',
    () => {
        assert(
            connection.state === STATES.CONNECTED,
            `Expected CONNECTED, got ${connection.state}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 2. ROUTE PERMISSION
 * ------------------------------------------------------------
 */

const routeTypes = [
    TYPES.ROUTE_MESSAGE,
    TYPES.ROUTE_NOTICE,
    TYPES.ROUTE_JOIN,
    TYPES.ROUTE_PART,
    TYPES.ROUTE_QUIT,
    TYPES.ROUTE_NICK,
    TYPES.ROUTE_MODE,
    TYPES.ROUTE_TOPIC
];

for (const frameType of routeTypes) {
    test(
        `ROUTE permission allows frame 0x${frameType.toString(16)}`,
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
 * 3. SYNC PERMISSION
 * ------------------------------------------------------------
 */

test(
    'SYNC permission allows synchronization',
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
 * 4. REVOKE TRUST
 * ------------------------------------------------------------
 */

test(
    'Revoking trusted server succeeds',
    () => {
        const result =
            manager.revokeServerTrust('remote-1');

        assert(
            result === true,
            `Expected revokeServerTrust() === true, got ${result}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 5. TRUST REGISTRY
 * ------------------------------------------------------------
 */

test(
    'Revoked server is removed from TrustRegistry',
    () => {
        assert(
            trustRegistry.getServer('remote-1') === null,
            'remote-1 is still trusted'
        );
    }
);

/*
 * ------------------------------------------------------------
 * 6. ACTIVE CONNECTION
 * ------------------------------------------------------------
 */

test(
    'Active S2S connection is destroyed after trust revocation',
    () => {
        assert(
            destroyed === true,
            'Active S2S connection was not destroyed'
        );

        assert(
            connection.state === STATES.CLOSED,
            `Expected CLOSED, got ${connection.state}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 7. ROUTE AFTER REVOCATION
 * ------------------------------------------------------------
 */

for (const frameType of routeTypes) {
    test(
        `Revoked server cannot ROUTE frame 0x${frameType.toString(16)}`,
        () => {
            const result = authorize(frameType);

            assert(
                result.authorized === false,
                `Expected denied authorization: ${JSON.stringify(result)}`
            );

            /*
             * Koska TrustRegistry poistaa palvelimen kokonaan,
             * authorization hylkää yhteyden jo SERVER_NOT_CONNECTED
             * -tasolla, koska manager tuhosi yhteyden.
             */
            assert(
                [
                    'SERVER_NOT_CONNECTED',
                    'SERVER_NOT_TRUSTED'
                ].includes(result.reason),
                `Unexpected denial reason: ${result.reason}`
            );
        }
    );
}

/*
 * ------------------------------------------------------------
 * 8. SYNC AFTER REVOCATION
 * ------------------------------------------------------------
 */

test(
    'Revoked server cannot SYNC',
    () => {
        const result = authorize(TYPES.SYNC);

        assert(
            result.authorized === false,
            `Expected denied authorization: ${JSON.stringify(result)}`
        );

        assert(
            [
                'SERVER_NOT_CONNECTED',
                'SERVER_NOT_TRUSTED'
            ].includes(result.reason),
            `Unexpected denial reason: ${result.reason}`
        );
    }
);

/*
 * ------------------------------------------------------------
 * 9. CONNECTION STAYS CLOSED
 * ------------------------------------------------------------
 */

test(
    'Revoked connection remains CLOSED',
    () => {
        assert(
            connection.state === STATES.CLOSED,
            `Connection unexpectedly became ${connection.state}`
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
    `[RESULT] Active S2S permission revocation tests: ` +
    `${passed}/${passed + failed}`
);

if (failed > 0) {
    process.exitCode = 1;
}