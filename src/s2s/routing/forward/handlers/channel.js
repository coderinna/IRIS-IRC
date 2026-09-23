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

    console.log(
        '[ROUTE DEBUG] CHANNEL CLIENTS:',
        target.clients.map(client => ({
            nick: client.nick,
            clientId: client.clientId,
            serverId: client.serverId,
            connection: !!client.connection
        }))
    );

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
        if (
            client.serverId ===
            connection.manager.serverId
        ) {
            const localClient =
                connection.manager.getLocalClientById
                    ? connection.manager.getLocalClientById(
                        client.clientId
                    )
                    : null;

            if (!localClient) {
                console.error(
                    `[IRIS] Local client not found: ` +
                    `${client.clientId}`
                );

                continue;
            }

            if (
                localClient ===
                sourceClient
            ) {
                continue;
            }

            localClient.send(
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