// src/s2s/connection/handlers/client.js

const crypto = require('node:crypto');

const {
    decodeClient,
    encodeClient
} = require('../../messages/client');

module.exports = function handleClient(
    connection,
    frame
) {
    try {
        const client =
            decodeClient(frame.payload);

        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        if (!connection.remote?.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

       /* if (
            client.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'CLIENT server ID does not match remote server'
            );
        }*/

        const remoteClient =
            connection.manager.remoteClients.register({
                clientId: client.clientId,
                serverId: client.serverId,
                nick: client.nick,
                user: client.user || '',
                host: client.host || '',
                connection
            });

        connection.manager.networkManager.addClient(
            remoteClient
        );

        console.log(
            `[IRIS] CLIENT REGISTERED ` +
            `clientId=${remoteClient.clientId} ` +
            `nick=${remoteClient.nick} ` +
            `serverId=${remoteClient.serverId}`
        );

        console.log(
            `[IRIS] ← CLIENT ` +
            `${client.serverId}:` +
            `${client.clientId} ` +
            `${client.nick}`
        );

        /*
         * Forward CLIENT to every other connected
         * S2S link, except the link it came from.
         */

        for (
            const nextConnection
            of connection.manager.connections
        ) {
            if (
                nextConnection === connection
            ) {
                continue;
            }

            if (
                nextConnection.state !==
                'connected'
            ) {
                continue;
            }

            const messageId =
                crypto.randomBytes(16);

            const sequence =
                nextConnection.nextSendSequence();

            const nextFrame =
                encodeClient(
                    {
                        clientId:
                            client.clientId,

                        nick:
                            client.nick,

                        user:
                            client.user || '',

                        host:
                            client.host || '',

                        serverId:
                            client.serverId
                    },
                    messageId,
                    sequence
                );

            nextConnection.sendTrackedFrame(
                nextFrame,
                messageId
            );

            console.log(
                `[IRIS] → CLIENT ` +
                `${client.nick} ` +
                `via ${nextConnection.remote?.serverId}`
            );
        }

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid CLIENT:',
            error.message
        );

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};