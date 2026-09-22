
// src/s2s/routing/handlers/channel.js

const {
    sendMessage
} = require('../../../messages/message');

module.exports = function handleChannel(
    connection,
    target,
    sourceClient,
    message
) {
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
};