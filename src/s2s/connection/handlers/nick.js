const {
    decodeNick
} = require('../../messages/nick');

module.exports = function handleNick(connection, frame) {
    try {
        const nick =
            decodeNick(frame.payload);

        console.log(
            `[IRISH] ← NICK ` +
            `${nick.clientId} ` +
            `${nick.oldNick} → ${nick.newNick} ` +
            `from ${nick.serverId}`
        );
    } catch (error) {
        console.error(
            '[IRISH] Invalid NICK:',
            error.message
        );

        connection.socket.destroy();
    }
};