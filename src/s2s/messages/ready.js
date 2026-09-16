const {
    TYPES,
    encodeFrame
} = require('../protocol/frame');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv');

const FIELDS = {
    STATUS: 0x01,
    SERVER_ID: 0x02
};

const STATUS = {
    READY: 'ready'
};

function encodeReady({
    serverId,
    status = STATUS.READY
}, messageId, sequence = 0n) {
    if (!serverId) {
        throw new Error(
            'IRISH READY requires serverId'
        );
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH READY messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.STATUS,
            value: status
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        }
    ];

    const payload = encodeFields(fields);

return encodeFrame({
    type: TYPES.READY,
    sequence,
    messageId,
    payload
});
}

function decodeReady(payload) {
    const fields = decodeFields(payload);

    const ready = {
        status: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.STATUS:
                ready.status =
                    field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                ready.serverId =
                    field.value.toString('utf8');
                break;

            default:
                // Tuntemattomat kentät ohitetaan.
                break;
        }
    }

    if (!ready.status) {
        throw new Error(
            'IRISH READY missing status'
        );
    }

    if (!ready.serverId) {
        throw new Error(
            'IRISH READY missing server ID'
        );
    }

    return ready;
}

module.exports = {
    FIELDS,
    STATUS,
    encodeReady,
    decodeReady
};