// src/s2s/routing/forward.js

const {
    sendMessage
} = require('../connection/messages');

module.exports = function forwardMessage(
    connection,
    message,
    target,
    sourceClient
) {
    if (!target) {
        return false;
    }

    if (target.type === 'local-client') {
        const targetClient =
            target.client;

        if (!targetClient || !sourceClient) {
            return false;
        }

        targetClient.send(
            `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
            `PRIVMSG ${targetClient.nick} :${message.message}`
        );

        console.log(
            `[IRIS] ← MESSAGE ` +
            `${sourceClient.nick} → ` +
            `${targetClient.nick} (local)`
        );

        return true;
    }

    if (target.type === 'remote-client') {
        const targetConnection =
            target.connection;

        if (!targetConnection) {
            return false;
        }

        if (
            targetConnection === connection
        ) {
            return false;
        }

        if (
            targetConnection.state !==
            'connected'
        ) {
            return false;
        }

        sendMessage(
            targetConnection,
            message,
            message.messageId
        );

        console.log(
            `[IRIS] → MESSAGE ` +
            `${message.clientId} → ` +
            `${target.client.nick} ` +
            `via ${target.client.serverId}`
        );

        return true;
    }

    if (target.type === 'channel') {
        const connections =
            new Set();

        let deliveredLocal =
            false;

        /*
         * Deliver to local clients.
         */
        for (
            const client
            of target.clients
        ) {
            if (!client) {
                continue;
            }

            if (!client.connection) {
                if (
                    client !== sourceClient
                ) {
                    client.send(
                        `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
                        `PRIVMSG ${target.channel.name} :${message.message}`
                    );

                    deliveredLocal = true;

                    console.log(
                        `[IRIS] ← MESSAGE ` +
                        `${sourceClient.nick} → ` +
                        `${target.channel.name} local`
                    );
                }
            }
        }

        /*
         * Forward to every other connected S2S peer.
         *
         * The incoming connection is excluded.
         * The channel membership is already synchronized
         * through JOIN propagation.
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

            connections.add(
                nextConnection
            );
        }

        let forwardedRemote =
            false;

        for (
            const targetConnection
            of connections
        ) {
            sendMessage(
                targetConnection,
                message,
                message.messageId
            );

            forwardedRemote = true;

            console.log(
                `[IRIS] → MESSAGE ` +
                `${message.clientId} → ` +
                `${target.channel.name} ` +
                `via ${targetConnection.remote?.serverId}`
            );
        }

        return (
            deliveredLocal ||
            forwardedRemote
        );
    }

    return false;
};