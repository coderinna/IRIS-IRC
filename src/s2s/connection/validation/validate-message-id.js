
// src/s2s/connection/validation/validate-message-id.js

module.exports = function validateMessageId(
    connection,
    frame
) {
    if (
        !frame.messageId ||
        frame.messageId.length !== 16
    ) {
        console.error(
            '[IRIS] Invalid S2S messageId'
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};