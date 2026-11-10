// src/s2s/connection/handlers/topic.js

const {
    decodeTopic,
    encodeTopic
} = require('../../messages/topic');

module.exports = function handleTopic(connection, frame) {
    try {
        const topic = decodeTopic(frame.payload);

        if (!connection.manager?.networkManager) {
            throw new Error('Network manager is not available');
        }

        const networkManager =
            connection.manager.networkManager;

        const client = networkManager.getClient(
            topic.serverId,
            topic.clientId
        );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${topic.clientId}`
            );
        }

        if (client.serverId !== topic.serverId) {
            throw new Error('TOPIC client server identity mismatch');
        }

        if (client.connection !== connection) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        const channel = networkManager.getChannel(topic.channel);

        if (!channel || !channel.clients.has(client)) {
            throw new Error(
                `Client is not a member of channel: ${topic.channel}`
            );
        }

        if (
            channel.hasMode('t') &&
            !channel.isOperator(client)
        ) {
            throw new Error(
                `Client ${client.nick} cannot change topic: ${topic.channel}`
            );
        }

        channel.setTopic(topic.topic);

        const message =
            `:${client.nick}!${client.user || '*'}@${client.host || 'localhost'} ` +
            `TOPIC ${channel.name} :${topic.topic}`;

        const localChannel = connection.manager
            .getLocalChannels()
            .find(item => item.name === topic.channel);

        if (localChannel) {
            for (const localClient of localChannel.getMembers()) {
                localClient.send(message);
            }
        }

        console.log(
            `[IRIS] ← TOPIC ${topic.channel}: ${topic.topic}`
        );

        // Forward TOPIC to other connected servers.
        for (const nextConnection of connection.manager.connections) {
            if (
                nextConnection === connection ||
                nextConnection.state !== 'connected'
            ) {
                continue;
            }

            try {
                const messageId = frame.messageId;

                const sequence =
                    nextConnection.nextSendSequence();

                const nextFrame = encodeTopic(
                    topic,
                    messageId,
                    sequence
                );

                nextConnection.sendTrackedFrame(
                    nextFrame,
                    messageId
                );

            } catch (error) {
                console.error(
                    '[IRIS] TOPIC propagation failed:',
                    error.message
                );
            }
        }

        return true;

    } catch (error) {
        console.error('[IRIS] Invalid TOPIC:', error.message);

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};