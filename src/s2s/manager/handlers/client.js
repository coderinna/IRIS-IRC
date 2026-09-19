// src/s2s/manager/handlers/client.js

const crypto = require('node:crypto');

const {
    encodeClient
} = require('../../messages/client');

module.exports = function handleClient(
    manager,
    client
) {
    if (!manager) {
        return false;
    }

    if (!client) {
        return false;
    }

    const remoteClient = {
        clientId: client.id,
        serverId: manager.serverId,
        nick: client.nick,
        user: client.user || '',
        host: client.host || ''
    };

    manager.remoteClients.register(
        remoteClient
    );

    manager.networkManager.addClient(
        remoteClient
    );

    console.log(
        `[IRIS] → CLIENT ` +
        `${remoteClient.clientId} ` +
        `${remoteClient.nick} ` +
        `from ${manager.serverId}`
    );

    for (
        const connection
        of manager.connections
    ) {
        if (
            connection.state !== 'connected'
        ) {
            continue;
        }

        const messageId =
            crypto.randomBytes(16);

        const sequence =
            connection.nextSendSequence();

        const frame =
            encodeClient(
                remoteClient,
                messageId,
                sequence
            );

        connection.sendTrackedFrame(
            frame,
            messageId
        );

        console.log(
            `[IRIS] → CLIENT ` +
            `${remoteClient.nick} ` +
            `via ${connection.remote?.serverId}`
        );
    }

    return true;
};