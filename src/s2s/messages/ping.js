const {
    TYPES,
    encodeFrame
} = require('../protocol/frame.js');

function encodePing(messageId, sequence) {
    return encodeFrame({
        version: 1,
        type: TYPES.PING,
        flags: 0,
        sequence,
        messageId,
        payload: Buffer.alloc(0)
    });
}

function decodePing(payload) {
    if (!Buffer.isBuffer(payload)) {
        throw new TypeError(
            'IRISH PING payload must be a Buffer'
        );
    }

    if (payload.length !== 0) {
        throw new Error(
            'IRISH PING payload must be empty'
        );
    }

    return true;
}

module.exports = {
    encodePing,
    decodePing
};
