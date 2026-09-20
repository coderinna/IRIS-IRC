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
        if (!connection.manager) {
            return false;
        }

        const route =
            connection.manager.getRoute(
                target.client.serverId
            );

        if (!route) {
            return false;
        }

        if (route === connection) {
            return false;
        }

        if (
            route.state !==
            'connected'
        ) {
            return false;
        }

        sendMessage(
            route,
            message,
            message.messageId
        );

        console.log(
            `[IRIS] → MESSAGE ` +
            `${message.clientId} → ` +
            `${target.client.nick} ` +
            `via ${route.remote?.serverId}`
        );

        return true;
    }

    if (target.type === 'channel') {
        if (!connection.manager) {
            return false;
        }

        const routeConnections =
            new Set();

        for (
            const client
            of target.clients
        ) {
            if (!client) {
                continue;
            }

            /*
             * Local client.
             */
            if (!client.serverId) {
                if (
                    client ===
                    sourceClient
                ) {
                    continue;
                }

                client.send(
                    `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
                    `PRIVMSG ${target.channel.name} :${message.message}`
                );

                console.log(
                    `[IRIS] ← MESSAGE ` +
                    `${sourceClient.nick} → ` +
                    `${target.channel.name} (local)`
                );

                continue;
            }

            /*
             * Do not send the message back
             * to the server where it came from.
             */
            const route =
                connection.manager.getRoute(
                    client.serverId
                );

            if (!route) {
                continue;
            }

            if (route === connection) {
                continue;
            }

            if (
                route.state !==
                'connected'
            ) {
                continue;
            }

            routeConnections.add(
                route
            );
        }

        /*
         * Send only once per next-hop connection.
         */
        for (
            const route
            of routeConnections
        ) {
            sendMessage(
                route,
                message,
                message.messageId
            );

            console.log(
                `[IRIS] → MESSAGE ` +
                `${message.clientId} → ` +
                `${target.channel.name} ` +
                `via ${route.remote?.serverId}`
            );
        }

        /*
         * The channel itself was a valid target.
         * No remote recipient is not a routing error.
         */
        return true;
    }

    return false;
};