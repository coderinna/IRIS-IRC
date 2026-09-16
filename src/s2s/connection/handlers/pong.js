const {
    decodePong
} = require('../../messages/pong');

module.exports = function handlePong(
    connection,
    frame
) {
    try {
        decodePong(frame.payload);

        if (connection.heartbeatTimeout) {
            clearTimeout(connection.heartbeatTimeout);
            connection.heartbeatTimeout = null;
        }

        console.log(
            `[IRISH] ← PONG ${connection.remote.serverId}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid PONG:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};