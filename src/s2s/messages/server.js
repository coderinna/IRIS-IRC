const {
    TYPES,
    encodeFrame
} = require('../protocol/frame');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv');

const FIELDS = {
    SERVER_ID: 0x01,
    SERVER_NAME: 0x02,
    SERVER_VERSION: 0x03,
    SERVER_ROLE: 0x04
};

const ROLES = {
    HUB: 'hub',
    LEAF: 'leaf'
};

const LIMITS = {
    SERVER_ID: 64,
    SERVER_NAME: 255,
    SERVER_VERSION: 128
};

function validateServerId(serverId) {
    if (
        typeof serverId !== 'string' ||
        serverId.length === 0 ||
        serverId.length > LIMITS.SERVER_ID
    ) {
        throw new Error(
            'IRISH SERVER serverId is invalid'
        );
    }
}

function validateServerName(serverName) {
    if (
        typeof serverName !== 'string' ||
        serverName.length === 0 ||
        serverName.length > LIMITS.SERVER_NAME
    ) {
        throw new Error(
            'IRISH SERVER serverName is invalid'
        );
    }
}

function validateServerVersion(serverVersion) {
    if (
        typeof serverVersion !== 'string' ||
        serverVersion.length === 0 ||
        serverVersion.length > LIMITS.SERVER_VERSION
    ) {
        throw new Error(
            'IRISH SERVER serverVersion is invalid'
        );
    }
}

function validateServerRole(serverRole) {
    if (
        serverRole !== ROLES.HUB &&
        serverRole !== ROLES.LEAF
    ) {
        throw new Error(
            'IRISH SERVER serverRole is invalid'
        );
    }
}

function encodeServer({
    serverId,
    serverName,
    serverVersion = 'iris-irc/0.1',
    serverRole = ROLES.HUB
}, messageId, sequence = 0n) {
    
    validateServerId(serverId);
    validateServerName(serverName);
    validateServerVersion(serverVersion);
    validateServerRole(serverRole);

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH SERVER messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        },
        {
            type: FIELDS.SERVER_NAME,
            value: serverName
        },
        {
            type: FIELDS.SERVER_VERSION,
            value: serverVersion
        },
        {
            type: FIELDS.SERVER_ROLE,
            value: serverRole
        }
    ];

    const payload = encodeFields(fields);

return encodeFrame({
    type: TYPES.SERVER,
    sequence,
    messageId,
    payload
});
}

function decodeServer(payload) {
    const fields = decodeFields(payload);

    const server = {
        serverId: null,
        serverName: null,
        serverVersion: null,
        serverRole: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.SERVER_ID:
                server.serverId =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_NAME:
                server.serverName =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_VERSION:
                server.serverVersion =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ROLE:
                server.serverRole =
                    field.value.toString('utf8');
                break;

            default:
                // Forward compatibility:
                // tuntemattomat kentät ohitetaan.
                break;
        }
    }

    validateServerId(server.serverId);
    validateServerName(server.serverName);
    validateServerVersion(server.serverVersion);
    validateServerRole(server.serverRole);

    return server;
}

module.exports = {
    FIELDS,
    ROLES,
    LIMITS,
    encodeServer,
    decodeServer
};