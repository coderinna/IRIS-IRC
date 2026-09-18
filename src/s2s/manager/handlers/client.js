const crypto = require('crypto');

const {
    encodeClient
} = require('../../messages/client');

module.exports = function handleClient(
    manager,
    client
) {
    if (!client || !client.nick) {
        return;
    }

    if (!client.id) {
        return;
    }

    const remoteClient = {
        serverId: manager.serverId,
        clientId: client.id,
        nick: client.nick,
        user: client.user || '',
        host: 'localhost'
    };

    manager.remoteClients.register(
        remoteClient
    );

    console.log(
        `[IRIS] Local client registered: ` +
        `${remoteClient.serverId}:${remoteClient.clientId} ` +
        `(${remoteClient.nick})`
    );

    console.log(
        `[IRIS] Broadcasting CLIENT: ${client.nick} ` +
        `connections=${manager.connections.size}`
    );

    for (const connection of manager.connections) {

        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

            const frame = encodeClient({
                clientId: client.id,
                nick: client.nick,
                user: client.user || '',
                host: 'localhost',
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(
                frame,
                messageId
            );

            console.log(
                `[IRIS] → CLIENT ` +
                `${client.nick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] CLIENT event failed:',
                error.message
            );
        }
    }
};