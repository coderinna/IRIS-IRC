const {
    TYPES,
    encodeFrame
} = require('../protocol/frame');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv');

const FIELDS = {
    AUTH_METHOD: 0x01,
    SERVER_ID: 0x02,
    TOKEN: 0x03
};

const METHODS = {
    TOKEN: 'token'
};

function encodeAuth({
    method = METHODS.TOKEN,
    serverId,
    token
}, messageId) {
    if (!serverId) {
        throw new Error(
            'IRISH AUTH requires serverId'
        );
    }

    if (!token) {
        throw new Error(
            'IRISH AUTH requires token'
        );
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH AUTH messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.AUTH_METHOD,
            value: method
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        },
        {
            type: FIELDS.TOKEN,
            value: token
        }
    ];

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.AUTH,
        messageId,
        payload
    });
}

function decodeAuth(payload) {
    const fields = decodeFields(payload);

    const auth = {
        method: null,
        serverId: null,
        token: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.AUTH_METHOD:
                auth.method =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                auth.serverId =
                    field.value.toString('utf8');
                break;

            case FIELDS.TOKEN:
                auth.token =
                    field.value.toString('utf8');
                break;

            default:
                // Tuntemattomat kentät jätetään huomiotta.
                break;
        }
    }

    if (!auth.method) {
        throw new Error(
            'IRISH AUTH missing auth method'
        );
    }

    if (!auth.serverId) {
        throw new Error(
            'IRISH AUTH missing server ID'
        );
    }

    if (!auth.token) {
        throw new Error(
            'IRISH AUTH missing token'
        );
    }

    return auth;
}

module.exports = {
    FIELDS,
    METHODS,
    encodeAuth,
    decodeAuth
};