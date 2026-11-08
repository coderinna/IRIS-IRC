// src/s2s/manager/handlers/join.js

const crypto = require('crypto');

const {
    encodeJoin
} = require('../../messages/join');

module.exports = function handleJoin(
    manager,
    client,
    channel
) {
    if (!client || !client.id || !channel) {
        return;
    }

    manager.networkManager.addClientToChannel(
        channel.name,
        {
            clientId: client.id,
            serverId: manager.serverId,
            nick: client.nick,
            user: client.user,
            host: client.host,
            connection: null
        }
    );

    console.log(
    `[IRIS] LOCAL CHANNEL STATE ` +
    `${channel.name}: ` +
    manager.networkManager
        .getChannel(channel.name)
        .clients
        .size
);

console.log(
    `[IRIS] LOCAL CHANNEL MEMBERS ` +
    `${channel.name}: ` +
    [...manager.networkManager.getChannel(channel.name).clients]
        .map(client =>
            `${client.nick}@${client.serverId}`
        )
        .join(', ')
);

    console.log(
        `[IRIS] Broadcasting JOIN: ` +
        `${client.nick} → ${channel.name}`
    );

    console.log(
        `[IRIS] JOIN connections=${manager.connections.size}`
    );

    for (const connection of manager.connections) {
        if (
            connection.state !==
            'connected'
        ) {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const sequence =
                connection.nextSendSequence();

const frame =
    encodeJoin(
        {
            clientId: client.id,
            channel: channel.name,
            serverId: manager.serverId,
            isOperator: channel.isOperator(client),
        },
        messageId,
        sequence
    );

            connection.sendTrackedFrame(
                frame,
                messageId
            );

            console.log(
                `[IRIS] → JOIN ` +
                `${client.nick} → ` +
                `${channel.name} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRIS] JOIN event failed:',
                error.message
            );
        }
    }
};