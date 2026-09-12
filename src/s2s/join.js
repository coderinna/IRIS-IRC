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
    SERVER_ID: 0x03
};

function encodeJoin({
    clientId,
    channel,
    serverId
}, messageId) {
    if (!clientId) {
        throw new Error('IRISH JOIN requires clientId');
    }

    if (!channel) {
        throw new Error('IRISH JOIN requires channel');
    }

    if (!serverId) {
        throw new Error('IRISH JOIN requires serverId');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH JOIN messageId must be a 16-byte Buffer'
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
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ]);

    return encodeFrame({
        type: TYPES.JOIN,
        messageId,
        payload
    });
}

function decodeJoin(payload) {
    const fields = decodeFields(payload);

    const join = {
        clientId: null,
        channel: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                join.clientId = field.value.toString('utf8');
                break;

            case FIELDS.CHANNEL:
                join.channel = field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                join.serverId = field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!join.clientId) {
        throw new Error('IRISH JOIN missing client ID');
    }

    if (!join.channel) {
        throw new Error('IRISH JOIN missing channel');
    }

    if (!join.serverId) {
        throw new Error('IRISH JOIN missing server ID');
    }

    return join;
}

module.exports = {
    FIELDS,
    encodeJoin,
    decodeJoin
};