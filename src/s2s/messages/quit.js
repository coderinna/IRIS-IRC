const {
    TYPES,
    encodeFrame
} = require('./protocol/frame');

const {
    encodeFields,
    decodeFields
} = require('./protocol/tlv');

const FIELDS = {
    CLIENT_ID: 0x01,
    REASON: 0x02,
    SERVER_ID: 0x03
};

function encodeQuit({
    clientId,
    reason = 'Quit',
    serverId
}, messageId) {
    if (!clientId) {
        throw new Error('IRISH QUIT requires clientId');
    }

    if (!serverId) {
        throw new Error('IRISH QUIT requires serverId');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH QUIT messageId must be a 16-byte Buffer'
        );
    }

    const payload = encodeFields([
        {
            type: FIELDS.CLIENT_ID,
            value: clientId
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
        type: TYPES.QUIT,
        messageId,
        payload
    });
}

function decodeQuit(payload) {
    const fields = decodeFields(payload);

    const quit = {
        clientId: null,
        reason: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                quit.clientId = field.value.toString('utf8');
                break;

            case FIELDS.REASON:
                quit.reason = field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                quit.serverId = field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!quit.clientId) {
        throw new Error('IRISH QUIT missing client ID');
    }

    if (!quit.serverId) {
        throw new Error('IRISH QUIT missing server ID');
    }

    return quit;
}

module.exports = {
    FIELDS,
    encodeQuit,
    decodeQuit
};