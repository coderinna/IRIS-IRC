
function validateMessageId(
    connection,
    frame
) {
    if (
        !frame ||
        !Buffer.isBuffer(frame.messageId) ||
        frame.messageId.length !== 16
    ) {
        console.warn(
            '[IRIS] Invalid outgoing message ID'
        );

        return false;
    }

    return true;
}

module.exports = {
validateMessageId
};