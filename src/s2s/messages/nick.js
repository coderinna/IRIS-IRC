const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv/tlv.js');

const FIELDS = {
    CLIENT_ID: 0x01,
    OLD_NICK: 0x02,
    NEW_NICK: 0x03,
    SERVER_ID: 0x04
};

function encodeNick({
    clientId,
    oldNick,
    newNick,
    serverId
}, messageId, sequence = 0n) {

    if (!clientId) {
        throw new Error(
            'IRISH NICK requires clientId'
        );
    }

    if (!newNick) {
        throw new Error(
            'IRISH NICK requires newNick'
        );
    }

    if (!serverId) {
        throw new Error(
            'IRISH NICK requires serverId'
        );
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH NICK messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.CLIENT_ID,
            value: clientId
        },
        {
            type: FIELDS.OLD_NICK,
            value: oldNick || ''
        },
        {
            type: FIELDS.NEW_NICK,
            value: newNick
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ];

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.NICK,
        messageId,
    sequence,
        payload
    });
}

function decodeNick(payload) {
    const fields = decodeFields(payload);

    const nick = {
        clientId: null,
        oldNick: null,
        newNick: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                nick.clientId =
                    field.value.toString('utf8');
                break;

            case FIELDS.OLD_NICK:
                nick.oldNick =
                    field.value.toString('utf8');
                break;

            case FIELDS.NEW_NICK:
                nick.newNick =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                nick.serverId =
                    field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!nick.clientId) {
        throw new Error(
            'IRISH NICK missing client ID'
        );
    }

    if (!nick.newNick) {
        throw new Error(
            'IRISH NICK missing new nick'
        );
    }

    if (!nick.serverId) {
        throw new Error(
            'IRISH NICK missing server ID'
        );
    }

    return nick;
}

module.exports = {
    FIELDS,
    encodeNick,
    decodeNick
};