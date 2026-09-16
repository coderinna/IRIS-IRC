const {
    TYPES,
    encodeFrame
} = require('../protocol/frame.js');

const ACK_MESSAGE_ID_SIZE = 16;

function encodeAck(
    acknowledgedMessageId,
    messageId,
    sequence
) {
    if (
        !Buffer.isBuffer(acknowledgedMessageId) ||
        acknowledgedMessageId.length !== ACK_MESSAGE_ID_SIZE
    ) {
        throw new TypeError(
            'IRISH ACK acknowledgedMessageId must be a 16-byte Buffer'
        );
    }

    const payload =
        Buffer.from(acknowledgedMessageId);

    return encodeFrame({
        version: 1,
        type: TYPES.ACK,
        flags: 0,
        sequence,
        messageId,
        payload
    });
}

function decodeAck(payload) {
    if (!Buffer.isBuffer(payload)) {
        throw new TypeError(
            'IRISH ACK payload must be a Buffer'
        );
    }

    if (payload.length !== ACK_MESSAGE_ID_SIZE) {
        throw new Error(
            'IRISH ACK payload must contain a 16-byte messageId'
        );
    }

    return {
        acknowledgedMessageId: Buffer.from(payload)
    };
}

module.exports = {
    ACK_MESSAGE_ID_SIZE,
    encodeAck,
    decodeAck
};