// src/s2s/messages/notice.js

const {
    TYPES,
    encodeFrame
} = require('../protocol/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv');

const FIELDS = {
    CLIENT_ID: 0x01,
    TARGET: 0x02,
    MESSAGE: 0x03,
    SERVER_ID: 0x04
};

function encodeNotice(
    {
        clientId,
        target,
        message,
        serverId
    },
    messageId,
    sequence = 0n
) {
    if (!clientId) {
        throw new Error(
            'IRIS NOTICE requires clientId'
        );
    }

    if (!target) {
        throw new Error(
            'IRIS NOTICE requires target'
        );
    }

    if (!message) {
        throw new Error(
            'IRIS NOTICE requires message'
        );
    }

    if (!serverId) {
        throw new Error(
            'IRIS NOTICE requires serverId'
        );
    }

    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRIS NOTICE messageId must be a 16-byte Buffer'
        );
    }

    const payload = encodeFields([
        {
            type: FIELDS.CLIENT_ID,
            value: clientId
        },
        {
            type: FIELDS.TARGET,
            value: target
        },
        {
            type: FIELDS.MESSAGE,
            value: message
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ]);

    return encodeFrame({
        type: TYPES.NOTICE,
        messageId,
        sequence,
        payload
    });
}

function decodeNotice(
    payload,
    messageId = null
) {
    const fields =
        decodeFields(payload);

    const notice = {
        messageId,
        clientId: null,
        target: null,
        message: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                notice.clientId =
                    field.value.toString('utf8');
                break;

            case FIELDS.TARGET:
                notice.target =
                    field.value.toString('utf8');
                break;

            case FIELDS.MESSAGE:
                notice.message =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                notice.serverId =
                    field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!notice.clientId) {
        throw new Error(
            'IRIS NOTICE missing client ID'
        );
    }

    if (!notice.target) {
        throw new Error(
            'IRIS NOTICE missing target'
        );
    }

    if (notice.message === null) {
        throw new Error(
            'IRIS NOTICE missing message'
        );
    }

    if (!notice.serverId) {
        throw new Error(
            'IRIS NOTICE missing server ID'
        );
    }

    return notice;
}

module.exports = {
    FIELDS,
    encodeNotice,
    decodeNotice
};