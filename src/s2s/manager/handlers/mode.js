// src/s2s/manager/handlers/mode.js

const crypto = require('crypto');

const {
    encodeMode
} = require('../../messages/mode');

module.exports = function handleMode(
    manager,
    client,
    channel,
    mode,
    targetNick
) {
    if (
        !client ||
        !client.id ||
        !channel ||
        !mode
    ) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting MODE: ` +
        `${client.nick} → ${channel.name} ${mode}`
    );

    for (const connection of manager.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId = crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

            const frame = encodeMode(
                {
                    clientId: client.id,
                    channel: channel.name,
                    mode,
                    targetNick: targetNick || '',
                    serverId: manager.serverId
                },
                messageId,
                sequence
            );

            connection.sendTrackedFrame(
                frame,
                messageId
            );

            console.log(
                `[IRIS] → MODE ` +
                `${channel.name} ${mode} ` +
                `${targetNick || ''} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] MODE event failed:',
                error.message
            );
        }
    }
};