const crypto = require('crypto');

const {
    encodeNick
} = require('../../messages/nick');

module.exports = function handleNick(
    manager,
    client,
    oldNick,
    newNick
) {
    if (!client || !client.id) {
        return;
    }

    if (!oldNick || !newNick) {
        return;
    }

    console.log(
        `[IRIS] Broadcasting NICK: ` +
        `${oldNick} → ${newNick}`
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

            const frame = encodeNick({
                clientId: client.id,
                oldNick,
                newNick,
                serverId: manager.serverId
            }, messageId, sequence);

            connection.sendTrackedFrame(frame, messageId);

            console.log(
                `[IRIS] → NICK ` +
                `${oldNick} → ${newNick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] NICK event failed:',
                error.message
            );
        }
    }
};