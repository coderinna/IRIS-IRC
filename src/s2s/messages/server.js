// src/s2s/messages/server.js

const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv/tlv.js');

const {
    validateServerId,
    validateServerName,
    validateServerVersion,
    validateServerRole,
    validateParentServerId,
    validateHopCount,
    validateMessageId
} = require('./server/index.js');


const FIELDS = {
    SERVER_ID: 0x01,
    SERVER_NAME: 0x02,
    SERVER_VERSION: 0x03,
    SERVER_ROLE: 0x04,
    PARENT_SERVER_ID: 0x05,
    HOP_COUNT: 0x06
};

const ROLES = {
    HUB: 'hub',
    LEAF: 'leaf'
};

const LIMITS = {
    SERVER_ID: 64,
    SERVER_NAME: 255,
    SERVER_VERSION: 128,
    PARENT_SERVER_ID: 64,
    HOP_COUNT: 65535
};

function encodeServer(
    {
        serverId,
        serverName,
        serverVersion = 'iris-irc/0.1',
        serverRole = ROLES.HUB,
        parentServerId = null,
        hopCount = 0
    },
    messageId,
    sequence = 0n
) {
    validateServerId(serverId);
    validateServerName(serverName);
    validateServerVersion(serverVersion);
    validateServerRole(serverRole);
    validateParentServerId(parentServerId);
    validateHopCount(hopCount);
    validateMessageId(messageId);

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
        },
        {
            type: FIELDS.HOP_COUNT,
            value: String(hopCount)
        }
    ];

    if (parentServerId !== null) {
        fields.push({
            type: FIELDS.PARENT_SERVER_ID,
            value: parentServerId
        });
    }

    const payload =
        encodeFields(fields);

    return encodeFrame({
        type: TYPES.SERVER,
        sequence,
        messageId,
        payload
    });
}

function decodeServer(payload) {
    const fields =
        decodeFields(payload);

    const server = {
        serverId: null,
        serverName: null,
        serverVersion: null,
        serverRole: null,
        parentServerId: null,
        hopCount: 0
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

            case FIELDS.PARENT_SERVER_ID:
                server.parentServerId =
                    field.value.toString('utf8');
                break;

            case FIELDS.HOP_COUNT:
                server.hopCount =
                    Number(
                        field.value.toString('utf8')
                    );
                break;

            default:
                // Tuntemattomat kentät ohitetaan.
                break;
        }
    }

    validateServerId(
        server.serverId
    );

    validateServerName(
        server.serverName
    );

    validateServerVersion(
        server.serverVersion
    );

    validateServerRole(
        server.serverRole
    );

    validateParentServerId(
        server.parentServerId
    );

    validateHopCount(
        server.hopCount
    );

    return server;
}

module.exports = {
    FIELDS,
    ROLES,
    LIMITS,
    encodeServer,
    decodeServer
};