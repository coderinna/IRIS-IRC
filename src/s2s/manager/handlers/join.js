// src/s2s/manager/handlers/join.js

const crypto = require('crypto');

const {
    encodeJoin
} = require('../../messages/join');

module.exports = function handleJoin(
    manager,
    client,
    channel
) {
    if (!client || !client.id || !channel) {
        return;
    }

    console.log(   `[IRIS] Broadcasting JOIN: ` +    `${client.nick} → ${channel.name}` );

    for (const connection of manager.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

            const frame = encodeJoin({
                clientId: client.id,
                channel: channel.name,
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(
                frame,
                messageId
            );

            console.log(    `[IRIS] → JOIN ` +     `${client.nick} → ${channel.name} ` +    `via ${connection.remote.serverId}`    );

        } catch (error) {
            console.error(
                '[IRIS] JOIN event failed:',
                error.message
            );
        }
    }
};