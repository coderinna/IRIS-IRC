// src/s2s/manager/handlers/notice.js

const crypto = require('crypto');

const {
    encodeNotice
} = require('../../messages/notice');

const {
    STATES
} = require('../../connection/states');

module.exports = function handleNotice(
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

    if (
    typeof target !== 'string'
) {
    return;
}

    console.log(
        `[IRIS] Broadcasting NOTICE: ` +
        `${client.nick} → ${targetName}`
    );

    for (const connection of manager.connections) {
        if (
            connection.state !==
            STATES.CONNECTED
        ) {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

            const frame =
                encodeNotice({
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
                `[IRIS] → NOTICE ` +
                `${client.nick} → ${targetName} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] NOTICE event failed:',
                error.message
            );
        }
    }
};