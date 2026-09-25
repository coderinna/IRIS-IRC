// src/s2s/routing/notice.js

const crypto =
    require('node:crypto');

const {
    encodeNotice
} = require('../messages/notice');

const resolveTarget =
    require('./resolveTarget/resolveTarget');

module.exports = function routeNotice(
    connection,
    notice,
    sourceClient
) {
    if (
        !connection.manager ||
        !connection.manager.networkManager ||
        !connection.manager.remoteClients
    ) {
        return false;
    }

    const networkManager =
        connection.manager.networkManager;

    const remoteClients =
        connection.manager.remoteClients;

    const target =
        resolveTarget(
            networkManager,
            remoteClients,
            connection.manager.getLocalClientByNick,
            notice.target
        );

    if (!target) {
        return false;
    }

    if (
        target.type ===
        'local-client'
    ) {
        const targetClient =
            target.client;

        targetClient.send(
            `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
            `NOTICE ${targetClient.nick} :${notice.message}`
        );

        console.log(
            `[IRIS] ← NOTICE ` +
            `${sourceClient.nick} → ` +
            `${targetClient.nick} (local)`
        );

        return true;
    }

    if (
        target.type ===
        'remote-client'
    ) {
        const route =
            connection.manager.getRoute(
                target.client.serverId
            );

        if (!route) {
            return false;
        }

        if (route === connection) {
            return false;
        }

        if (
            route.state !==
            'connected'
        ) {
            return false;
        }

        const messageId =
            notice.messageId ||
            crypto.randomBytes(16);

        const sequence =
            route.nextSendSequence();

        const frame =
            encodeNotice(
                {
                    clientId:
                        sourceClient.clientId,

                    target:
                        notice.target,

                    message:
                        notice.message,

                    serverId:
                        sourceClient.serverId
                },
                messageId,
                sequence
            );

        route.sendTrackedFrame(
            frame,
            messageId
        );

        console.log(
            `[IRIS] → NOTICE ` +
            `${sourceClient.nick} → ` +
            `${target.client.nick} ` +
            `via ${route.remote?.serverId}`
        );

        return true;
    }

    if (
        target.type ===
        'channel'
    ) {
        for (
            const targetClient
            of target.channel.clients
        ) {
            if (!targetClient) {
                continue;
            }

            if (
                targetClient ===
                sourceClient
            ) {
                continue;
            }

            if (
                targetClient.serverId ===
                connection.manager.serverId
            ) {
                targetClient.send(
                    `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
                    `NOTICE ${notice.target} :${notice.message}`
                );
            }
        }

        console.log(
            `[IRIS] ← NOTICE ` +
            `${sourceClient.nick} → ` +
            `${notice.target} (channel)`
        );

        return true;
    }

    return false;
};