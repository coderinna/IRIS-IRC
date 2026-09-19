// src/s2s/connection/handlers/server.js

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
            connection.state === STATES.CONNECTED
        ) {
            if (!connection.manager) {
                throw new Error(
                    'IRIS SERVER requires manager'
                );
            }

            const registered =
                connection.manager.registerIntroducedServer(
                    connection,
                    server
                );

            if (!registered) {
                throw new Error(
                    `IRIS SERVER introduction rejected: ${server.serverId}`
                );
            }

            return true;
        }

        if (
            server.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'IRIS SERVER server ID does not match HELLO'
            );
        }

        connection.remote.serverName =
            server.serverName;

        connection.remote.serverVersion =
            server.serverVersion;

        connection.remote.serverRole =
            server.serverRole;

        connection.remote.parentServerId =
            server.parentServerId;

        connection.remote.hopCount =
            server.hopCount;

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