// src/s2s/connection/messages/sendAck.js

const crypto = require('crypto');

const {
    encodeAck
} = require('../../messages/ack');

module.exports = function sendAck(
    connection,
    acknowledgedMessageId
) {
    if (
        !Buffer.isBuffer(
            acknowledgedMessageId
        ) ||
        acknowledgedMessageId.length !== 16
    ) {
        throw new TypeError(
            'IRIS ACK acknowledgedMessageId must be a 16-byte Buffer'
        );
    }

    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeAck(
            acknowledgedMessageId,
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};