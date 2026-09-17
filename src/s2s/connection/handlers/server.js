const {
    decodeServer
} = require('../../messages/server');

const {
    STATES
} = require('../states.js');

module.exports = function handleServer(
    connection,
    frame
) {
    try {
        const server =
            decodeServer(frame.payload);

            if (
    server.serverId !==
    connection.remote.serverId
) {
    throw new Error(
        'IRISH SERVER server ID does not match HELLO'
    );
}


        connection.remote.serverName =
            server.serverName;

        connection.remote.serverVersion =
            server.serverVersion;

        connection.remote.serverRole =
            server.serverRole;

        console.log(
            `[IRIS] ← SERVER ${server.serverId} ` +
            `${server.serverName} ` +
            `(${server.serverRole})`
        );

     connection.state = STATES.READY;

        connection.sendReady();

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid SERVER:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};