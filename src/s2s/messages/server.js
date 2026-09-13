const {
    TYPES,
    encodeFrame
} = require('./protocol/frame');

const {
    encodeFields,
    decodeFields
} = require('./protocol/tlv');

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

function encodeServer({
    serverId,
    serverName,
    serverVersion = 'iris-irc/0.1',
    serverRole = ROLES.HUB
}, messageId) {
    if (!serverId) {
        throw new Error(
            'IRISH SERVER requires serverId'
        );
    }

    if (!serverName) {
        throw new Error(
            'IRISH SERVER requires serverName'
        );
    }

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

    if (!server.serverId) {
        throw new Error(
            'IRISH SERVER missing server ID'
        );
    }

    if (!server.serverName) {
        throw new Error(
            'IRISH SERVER missing server name'
        );
    }

    if (!server.serverVersion) {
        throw new Error(
            'IRISH SERVER missing server version'
        );
    }

    if (!server.serverRole) {
        throw new Error(
            'IRISH SERVER missing server role'
        );
    }

    return server;
}

module.exports = {
    FIELDS,
    ROLES,
    encodeServer,
    decodeServer
};