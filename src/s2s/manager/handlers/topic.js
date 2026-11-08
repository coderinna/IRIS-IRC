// src/s2s/manager/handlers/topic.js

const crypto = require('crypto');

const {
    encodeTopic
} = require('../../messages/topic');

module.exports = function handleTopic(
    manager,
    client,
    channel,
    topic
) {
    if (
        !client ||
        !client.id ||
        !channel ||
        topic === undefined ||
        topic === null
    ) {
        return;
    }

    for (const connection of manager.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId = crypto.randomBytes(16);

            const sequence = connection.nextSendSequence();

            const frame = encodeTopic(
                {
                    clientId: client.id,
                    channel: channel.name,
                    topic,
                    serverId: manager.serverId
                },
                messageId,
                sequence
            );

            connection.sendTrackedFrame(frame, messageId);

            console.log(
                `[IRIS] → TOPIC ${channel.name} via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] TOPIC event failed:',
                error.message
            );
        }
    }
};