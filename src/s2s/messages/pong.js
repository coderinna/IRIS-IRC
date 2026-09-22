const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

function encodePong(messageId, sequence) {
    return encodeFrame({
        version: 1,
        type: TYPES.PONG,
        flags: 0,
        sequence,
        messageId,
        payload: Buffer.alloc(0)
    });
}

function decodePong(payload) {
    if (!Buffer.isBuffer(payload)) {
        throw new TypeError(
            'IRISH PONG payload must be a Buffer'
        );
    }

    if (payload.length !== 0) {
        throw new Error(
            'IRISH PONG payload must be empty'
        );
    }

    return true;
}

module.exports = {
    encodePong,
    decodePong
};
