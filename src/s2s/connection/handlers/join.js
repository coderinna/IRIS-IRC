const {
    decodeJoin
} = require('../../messages/join');

module.exports = function handleJoin(
    connection,
    frame
) {
    try {
        const join =
            decodeJoin(frame.payload);

        console.log(
            `[IRISH] ← JOIN ` +
            `${join.clientId} ` +
            `→ ${join.channel} ` +
            `from ${join.serverId}`
        );

    } catch (error) {
        console.error(
            '[IRISH] Invalid JOIN:',
            error.message
        );

        connection.socket.destroy();
    }
};