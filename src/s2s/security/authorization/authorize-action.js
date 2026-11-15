
const { STATES } = require('../connection/states.js');

const CONTROL_FRAMES = new Set([
    0x01, // HELLO
    0x02, // AUTH
    0x03, // SERVER
    0x04, // READY
    0x20, // PING
    0x21, // PONG
    0x22  // ACK
]);

const FRAME_ACTIONS = {
    [0x03]: 'introduce',

    [0x10]: 'sync',
    [0x17]: 'sync',

    [0x11]: 'route',
    [0x12]: 'route',
    [0x13]: 'route',
    [0x14]: 'route',
    [0x15]: 'route',
    [0x16]: 'route',
    [0x18]: 'route',
    [0x19]: 'route'
};

const ACTION_CONFIG = {
    introduce: {
        permission: 'introduce',
        policy: 'allowServerIntroduction'
    },
    route: {
        permission: 'route',
        policy: 'allowRouting'
    },
    sync: {
        permission: 'sync',
        policy: 'allowSynchronization'
    }
};

module.exports = function authorizeAction({
    connection,
    frameType
}) {
    if (!connection) {
        return {
            authorized: false,
            reason: 'CONNECTION_MISSING'
        };
    }

    // Kättely- ja yhteydenhallintakehykset eivät
    // kuulu normaaliin toimintovaltuutukseen.
    if (CONTROL_FRAMES.has(frameType)) {
        return {
            authorized: true,
            skipped: true,
            reason: 'CONTROL_FRAME'
        };
    }

    if (connection.state !== STATES.CONNECTED) {
        return {
            authorized: false,
            reason: 'SERVER_NOT_CONNECTED'
        };
    }

    const serverId = connection.remote?.serverId;

    if (!serverId) {
        return {
            authorized: false,
            reason: 'REMOTE_SERVER_ID_MISSING'
        };
    }

    const trustRegistry = connection.trustRegistry;
    const serverPolicy = connection.serverPolicy;

    if (!trustRegistry || !serverPolicy) {
        return {
            authorized: false,
            reason: 'AUTHORIZATION_CONFIG_MISSING'
        };
    }

    const action = FRAME_ACTIONS[frameType];

    if (!action) {
        return {
            authorized: false,
            reason: 'FRAME_NOT_AUTHORIZED',
            frameType
        };
    }

    const config = ACTION_CONFIG[action];

    const trustedServer = trustRegistry.getServer(serverId);

    if (!trustedServer) {
        return {
            authorized: false,
            reason: 'SERVER_NOT_TRUSTED'
        };
    }

    if (
        trustedServer.permissions?.[config.permission] !== true
    ) {
        return {
            authorized: false,
            reason: 'ACTION_PERMISSION_DENIED',
            action,
            serverId
        };
    }

    if (serverPolicy[config.policy] !== true) {
        return {
            authorized: false,
            reason: 'LOCAL_POLICY_DENIED',
            action,
            serverId
        };
    }

    return {
        authorized: true,
        action,
        serverId
    };
};
