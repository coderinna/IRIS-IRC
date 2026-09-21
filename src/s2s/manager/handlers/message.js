const crypto = require('crypto');

const {
    encodeMessage
} = require('../../messages/message');

const {
    STATES
} = require('../../connection/states');

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

    const targetName =
        typeof target === 'string'
            ? target
            : target.nick;

    if (!targetName) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting MESSAGE: ` +
        `${client.nick} → ${targetName}`
    );

    for (const connection of manager.connections) {
        if (connection.state !== STATES.CONNECTED) {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

const frame = encodeMessage({
    clientId: client.id,
    target: targetName,
    message,
    serverId: manager.serverId
}, messageId, sequence);

            connection.sendTrackedFrame(
                frame,
                messageId
            );

            console.log(
                `[IRIS] → MESSAGE ` +
                `${client.nick} → ${targetName} ` +
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