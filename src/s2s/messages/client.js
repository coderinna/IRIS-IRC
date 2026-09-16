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
    NICK: 0x02,
    USER: 0x03,
    HOST: 0x04,
    SERVER_ID: 0x05
};

function encodeClient({
    clientId,
    nick,
    user,
    host,
    serverId
}, messageId) {
    if (!clientId) {
        throw new Error(
            'IRISH CLIENT requires clientId'
        );
    }

    if (!nick) {
        throw new Error(
            'IRISH CLIENT requires nick'
        );
    }

    if (!serverId) {
        throw new Error(
            'IRISH CLIENT requires serverId'
        );
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH CLIENT messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.CLIENT_ID,
            value: clientId
        },
        {
            type: FIELDS.NICK,
            value: nick
        },
        {
            type: FIELDS.USER,
            value: user || ''
        },
        {
            type: FIELDS.HOST,
            value: host || ''
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ];

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.CLIENT,
        messageId,
        payload
    });
}

function decodeClient(payload) {
    const fields = decodeFields(payload);

    const client = {
        clientId: null,
        nick: null,
        user: null,
        host: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                client.clientId =
                    field.value.toString('utf8');
                break;

            case FIELDS.NICK:
                client.nick =
                    field.value.toString('utf8');
                break;

            case FIELDS.USER:
                client.user =
                    field.value.toString('utf8');
                break;

            case FIELDS.HOST:
                client.host =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                client.serverId =
                    field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!client.clientId) {
        throw new Error(
            'IRISH CLIENT missing client ID'
        );
    }

    if (!client.nick) {
        throw new Error(
            'IRISH CLIENT missing nick'
        );
    }

    if (!client.serverId) {
        throw new Error(
            'IRISH CLIENT missing server ID'
        );
    }

    return client;
}

module.exports = {
    FIELDS,
    encodeClient,
    decodeClient
};