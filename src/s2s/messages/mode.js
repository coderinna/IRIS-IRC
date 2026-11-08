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
    CHANNEL: 0x02,
    MODE: 0x03,
    TARGET_NICK: 0x04,
    SERVER_ID: 0x05
};

function encodeMode({
    clientId,
    channel,
    mode,
    targetNick = '',
    serverId
}, messageId, sequence = 0n) {

    if (!clientId || !channel || !mode || !serverId) {
        throw new Error('IRIS MODE missing required fields');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError('IRIS MODE messageId must be a 16-byte Buffer');
    }

    const fields = [
        { type: FIELDS.CLIENT_ID, value: clientId },
        { type: FIELDS.CHANNEL, value: channel },
        { type: FIELDS.MODE, value: mode },
        { type: FIELDS.TARGET_NICK, value: targetNick },
        { type: FIELDS.SERVER_ID, value: serverId }
    ];

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.MODE,
        messageId,
        sequence,
        payload
    });
}

function decodeMode(payload) {
    const fields = decodeFields(payload);

    const mode = {
        clientId: null,
        channel: null,
        mode: null,
        targetNick: '',
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                mode.clientId = field.value.toString('utf8');
                break;
            case FIELDS.CHANNEL:
                mode.channel = field.value.toString('utf8');
                break;
            case FIELDS.MODE:
                mode.mode = field.value.toString('utf8');
                break;
            case FIELDS.TARGET_NICK:
                mode.targetNick = field.value.toString('utf8');
                break;
            case FIELDS.SERVER_ID:
                mode.serverId = field.value.toString('utf8');
                break;
        }
    }

    if (!mode.clientId || !mode.channel || !mode.mode || !mode.serverId) {
        throw new Error('IRIS MODE missing required fields');
    }

    return mode;
}

module.exports = {
    FIELDS,
    encodeMode,
    decodeMode
};