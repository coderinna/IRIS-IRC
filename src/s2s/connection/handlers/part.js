const {
    decodePart
} = require('../part');

module.exports = function handlePart(
    connection,
    frame
) {
    try {
        const part =
            decodePart(frame.payload);

        console.log(
            `[IRISH] ← PART ` +
            `${part.clientId} ` +
            `← ${part.channel} ` +
            `from ${part.serverId}`
        );

    } catch (error) {
        console.error(
            '[IRISH] Invalid PART:',
            error.message
        );

        connection.socket.destroy();
    }
};