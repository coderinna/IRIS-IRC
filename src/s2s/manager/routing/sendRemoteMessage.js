// src/s2s/manager/routing/sendRemoteMessage.js

const crypto = require('node:crypto');

module.exports = function sendRemoteMessage(
    manager,
    serverId,
    clientId,
    message
) {
    if (!serverId || !clientId) {
        return false;
    }

    if (!message) {
        return false;
    }

    const connection =
        manager.getClientRoute(
            serverId,
            clientId
        );

    if (!connection) {
        console.warn(
            `[IRIS] No route to remote client ` +
            `${serverId}:${clientId}`
        );

        return false;
    }

    const messageId =
        crypto.randomBytes(16);

    connection.sendMessage(
        message,
        messageId
    );

    console.log(
        `[IRIS] → ROUTE MESSAGE ` +
        `${serverId}:${clientId} via ` +
        `${connection.remote?.serverId}`
    );

    return true;
};