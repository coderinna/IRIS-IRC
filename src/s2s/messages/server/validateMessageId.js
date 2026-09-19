// src/s2s/messages/server/validateMessageId.js

function validateMessageId(messageId) {
    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRIS SERVER messageId must be a 16-byte Buffer'
        );
    }
}

module.exports = validateMessageId;