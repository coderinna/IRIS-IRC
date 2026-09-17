const crypto = require('crypto');

const {
    encodePart
} = require('../../messages/part');

module.exports = function handlePart(
    manager,
    client,
    channel,
    reason = ''
) {
    if (!client || !client.id || !channel) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting PART: ` +
        `${client.nick} ← ${channel}`
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

            const frame = encodePart({
                clientId: client.id,
                channel,
                reason,
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(frame, messageId);

            console.log(
                `[IRIS] → PART ` +
                `${client.nick} ← ${channel} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] PART event failed:',
                error.message
            );
        }
    }
};