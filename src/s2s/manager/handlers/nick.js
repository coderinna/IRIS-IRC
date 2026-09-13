const crypto = require('crypto');

const {
    encodeNick
} = require('../nick');

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
        `[IRISH] Broadcasting NICK: ` +
        `${oldNick} → ${newNick}`
    );

    for (const connection of manager.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodeNick({
                clientId: client.id,
                oldNick,
                newNick,
                serverId: manager.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → NICK ` +
                `${oldNick} → ${newNick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] NICK event failed:',
                error.message
            );
        }
    }
};