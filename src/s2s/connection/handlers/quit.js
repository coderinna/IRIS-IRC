const {
    decodeQuit
} = require('../../messages/quit');

module.exports = function handleQuit(
    connection,
    frame
) {
    try {
        const quit =
            decodeQuit(frame.payload);

        console.log(
            `[IRISH] ← QUIT ` +
            `${quit.clientId} ` +
            `from ${quit.serverId}`
        );

    } catch (error) {
        console.error(
            '[IRISH] Invalid QUIT:',
            error.message
        );

        connection.socket.destroy();
    }
};