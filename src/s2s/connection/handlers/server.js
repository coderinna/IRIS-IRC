const {
    decodeServer
} = require('../../messages/server');

module.exports = function handleServer(
    connection,
    frame
) {
    try {
        const server =
            decodeServer(frame.payload);

        connection.remote.serverId =
            server.serverId;

        connection.remote.serverName =
            server.serverName;

        connection.remote.serverVersion =
            server.serverVersion;

        connection.remote.serverRole =
            server.serverRole;

        console.log(
            `[IRISH] ← SERVER ${server.serverId} ` +
            `${server.serverName} ` +
            `(${server.serverRole})`
        );

        connection.state = 'ready';

        connection.sendReady();

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid SERVER:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};