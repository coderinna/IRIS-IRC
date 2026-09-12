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
    CHANNEL: 0x02,
    REASON: 0x03,
    SERVER_ID: 0x04
};

function encodePart({
    clientId,
    channel,
    reason = '',
    serverId
}, messageId) {
    if (!clientId) {
        throw new Error('IRISH PART requires clientId');
    }

    if (!channel) {
        throw new Error('IRISH PART requires channel');
    }

    if (!serverId) {
        throw new Error('IRISH PART requires serverId');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH PART messageId must be a 16-byte Buffer'
        );
    }

    const payload = encodeFields([
        {
            type: FIELDS.CLIENT_ID,
            value: clientId
        },
        {
            type: FIELDS.CHANNEL,
            value: channel
        },
        {
            type: FIELDS.REASON,
            value: reason
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ]);

    return encodeFrame({
        type: TYPES.PART,
        messageId,
        payload
    });
}

function decodePart(payload) {
    const fields = decodeFields(payload);

    const part = {
        clientId: null,
        channel: null,
        reason: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                part.clientId = field.value.toString('utf8');
                break;

            case FIELDS.CHANNEL:
                part.channel = field.value.toString('utf8');
                break;

            case FIELDS.REASON:
                part.reason = field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                part.serverId = field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!part.clientId) {
        throw new Error('IRISH PART missing client ID');
    }

    if (!part.channel) {
        throw new Error('IRISH PART missing channel');
    }

    if (!part.serverId) {
        throw new Error('IRISH PART missing server ID');
    }

    return part;
}

module.exports = {
    FIELDS,
    encodePart,
    decodePart
};