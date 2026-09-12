const {
    TYPES,
    encodeFrame
} = require('./frame');

const {
    encodeFields,
    decodeFields
} = require('./tlv');

const FIELDS = {
    CLIENT_ID: 0x01,
    TARGET: 0x02,
    MESSAGE: 0x03,
    SERVER_ID: 0x04
};

function encodeMessage({
    clientId,
    target,
    message,
    serverId
}, messageId) {
    if (!clientId) {
        throw new Error('IRISH MESSAGE requires clientId');
    }

    if (!target) {
        throw new Error('IRISH MESSAGE requires target');
    }

    if (!message) {
        throw new Error('IRISH MESSAGE requires message');
    }

    if (!serverId) {
        throw new Error('IRISH MESSAGE requires serverId');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH MESSAGE messageId must be a 16-byte Buffer'
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
        type: TYPES.MESSAGE,
        messageId,
        payload
    });
}

function decodeMessage(payload) {
    const fields = decodeFields(payload);

    const message = {
        clientId: null,
        target: null,
        message: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                message.clientId =
                    field.value.toString('utf8');
                break;

            case FIELDS.TARGET:
                message.target =
                    field.value.toString('utf8');
                break;

            case FIELDS.MESSAGE:
                message.message =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                message.serverId =
                    field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!message.clientId) {
        throw new Error(
            'IRISH MESSAGE missing client ID'
        );
    }

    if (!message.target) {
        throw new Error(
            'IRISH MESSAGE missing target'
        );
    }

    if (message.message === null) {
        throw new Error(
            'IRISH MESSAGE missing message'
        );
    }

    if (!message.serverId) {
        throw new Error(
            'IRISH MESSAGE missing server ID'
        );
    }

    return message;
}

module.exports = {
    FIELDS,
    encodeMessage,
    decodeMessage
};