
// src/s2s/routing/handlers/remote-client.js

const {
    sendMessage
} = require('../../messages/message');

module.exports = function handleRemoteClient(
    connection,
    target,
    message
) {
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
};