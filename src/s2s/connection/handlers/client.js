const {
    decodeClient
} = require('../../messages/client');

module.exports = function handleClient(
    connection,
    frame
) {
    try {
        const client =
            decodeClient(frame.payload);

        console.log(
            `[IRISH] ← CLIENT ` +
            `${client.clientId} ` +
            `${client.nick} ` +
            `from ${client.serverId}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid CLIENT:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};