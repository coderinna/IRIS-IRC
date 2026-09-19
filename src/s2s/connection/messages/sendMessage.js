// src/s2s/connection/messages/sendMessage.js

const {
    encodeMessage
} = require('../../messages/message');

module.exports = function sendMessage(
    connection,
    message,
    messageId
) {
    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRIS MESSAGE messageId must be a 16-byte Buffer'
        );
    }

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeMessage(
            message,
            messageId,
            sequence
        );

    return connection.sendTrackedFrame(
        frame,
        messageId
    );
};