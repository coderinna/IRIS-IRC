// src/s2s/manager/routing/sendRemoteMessage.js

const crypto = require('node:crypto');

module.exports = function sendRemoteMessage(
    manager,
    clientId,
    message
) {
    if (!clientId) {
        return false;
    }

    if (!message) {
        return false;
    }

    const connection =
        manager.getClientRoute(
            clientId
        );

    if (!connection) {
        console.warn(
            `[IRIS] No route to remote client ${clientId}`
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
        `${clientId} via ` +
        `${connection.remote?.serverId}`
    );

    return true;
};