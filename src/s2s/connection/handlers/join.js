// src/s2s/connection/handlers/join.js

const crypto = require('crypto');

const {
    decodeJoin,
    encodeJoin
} = require('../../messages/join');

module.exports = function handleJoin(
    connection,
    frame
) {
    try {
        const join =
            decodeJoin(frame.payload);

        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        if (!connection.manager.networkManager) {
            throw new Error(
                'Network manager is not available'
            );
        }

        if (!connection.remote.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                join.serverId,
                join.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${join.clientId}`
            );
        }

        console.log(
    `[IRIS] JOIN ROUTE client=${client.clientId} ` +
    `server=${client.serverId} ` +
    `connection=${client.connection?.remote?.serverId || 'local'}`
);

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        let channel =
            networkManager.getChannel(
                join.channel
            );

        if (!channel) {
            channel =
                networkManager.addChannel({
                    name: join.channel
                });
        }

        networkManager.addClientToChannel(
            join.channel,
            client
        );

        console.log(
            `[IRIS] CHANNEL STATE ` +
            `${join.channel} ` +
            `clients=${channel.clients.size}`
        );

        console.log(
            `[IRIS] ← JOIN ` +
            `${join.clientId} ` +
            `${join.channel}`
        );

        /*
         * Forward JOIN to every other connected S2S peer.
         * The incoming connection is excluded so the JOIN
         * cannot immediately travel back to the sender.
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

            try {
                const messageId =
                    frame.messageId ||
                    crypto.randomBytes(16);

                const sequence =
                    nextConnection.nextSendSequence();

                const nextFrame =
                    encodeJoin(
                        {
                            clientId: join.clientId,
                            channel: join.channel,
                            serverId: join.serverId
                        },
                        messageId,
                        sequence
                    );

                nextConnection.sendTrackedFrame(
                    nextFrame,
                    messageId
                );

                console.log(
                    `[IRIS] → JOIN ` +
                    `${join.clientId} ` +
                    `${join.channel} ` +
                    `via ${nextConnection.remote?.serverId}`
                );

            } catch (error) {
                console.error(
                    '[IRIS] JOIN propagation failed:',
                    error.message
                );
            }
        }

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid JOIN:',
            error.message
        );

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};