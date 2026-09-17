const crypto = require('crypto');

const {
    encodeMessage
} = require('../../messages/message');

module.exports = function handleMessage(
    manager,
    client,
    target,
    message
) {
    if (!client || !client.id) {
        return;
    }

    if (!target || !message) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting MESSAGE: ` +
        `${client.nick} → ${target}`
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

            const frame = encodeMessage({
                clientId: client.id,
                target,
                message,
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(frame, messageId);

            console.log(
                `[IRIS] → MESSAGE ` +
                `${client.nick} → ${target} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] MESSAGE event failed:',
                error.message
            );
        }
    }
};