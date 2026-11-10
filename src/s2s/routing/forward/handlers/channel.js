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

    // +n: only channel members may send messages
    if (
        target.channel.hasMode('n') &&
        !target.channel.hasClient(sourceClient)
    ) {
        console.log(
            `[IRIS] BLOCKED external message to ` +
            `${target.channel.name} (+n)`
        );

        return false;
    }

        // +m: only operators and voiced members may speak
    if (
        target.channel.hasMode('m') &&
        !target.channel.isOperator(sourceClient) &&
        !target.channel.hasVoice(sourceClient)
    ) {
        console.log(
            `[IRIS] BLOCKED message to ` +
            `${target.channel.name} (+m)`
        );

        return false;
    }

    const routeConnections = new Set();

    console.log(
        '[ROUTE DEBUG] CHANNEL CLIENTS:',
        target.clients.map(client => ({
            nick: client.nick,
            clientId: client.clientId,
            serverId: client.serverId,
            connection: !!client.connection
        }))
    );

    for (const client of target.clients) {
        if (!client) {
            continue;
        }

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
                console.log(
                    '[ROUTE DEBUG] LOCAL CLIENT NOT FOUND:',
                    client.nick
                );

                continue;
            }

            if (localClient === sourceClient) {
                continue;
            }

            localClient.send(
                `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} PRIVMSG ${target.channel.name} :${message.message}`
            );

            continue;
        }

        const route = connection.manager.getRoute(
            client.serverId
        );

        if (
            !route ||
            route === connection ||
            route.state !== 'connected'
        ) {
            continue;
        }

        routeConnections.add(route);
    }

    for (const route of routeConnections) {
        sendMessage(
            route,
            message,
            message.messageId
        );
    }

    return true;
};