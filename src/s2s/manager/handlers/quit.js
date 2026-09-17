const crypto = require('crypto');

const {
    encodeQuit
} = require('../../messages/quit');

module.exports = function handleQuit(
    manager,
    client,
    reason = ''
) {
    if (!client || !client.id) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting QUIT: ` +
        `${client.nick}`
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

            const frame = encodeQuit({
                clientId: client.id,
                reason,
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(frame, messageId);

            console.log(
                `[IRIS] → QUIT ` +
                `${client.nick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] QUIT event failed:',
                error.message
            );
        }
    }
};