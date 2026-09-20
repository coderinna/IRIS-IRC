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

    /*
     * Local client target
     */
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

    /*
     * Remote client target
     */
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

    /*
     * Channel target
     */
    if (target.type === 'channel') {
        const connections =
            new Set();

        let deliveredLocal =
            false;

        /*
         * Deliver to local clients
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
                        `${target.channel.name} ` +
                        `local`
                    );
                }

                continue;
            }

            /*
             * Remote client:
             * collect its S2S connection.
             */
            if (
                client.connection === connection
            ) {
                continue;
            }

            if (
                client.connection.state !==
                'connected'
            ) {
                continue;
            }

            connections.add(
                client.connection
            );
        }

        /*
         * Forward once per S2S connection
         */
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
                `via ${targetConnection.remote.serverId}`
            );
        }

        return (
            deliveredLocal ||
            forwardedRemote
        );
    }

    return false;
};