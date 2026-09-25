// src/s2s/connection/handlers/nick.js

const {
    decodeNick
} = require('../../messages/nick');

module.exports = function handleNick(
    connection,
    frame
) {
    try {
        const nick =
            decodeNick(frame.payload);

        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        if (!connection.manager.networkManager) {
            throw new Error(
                'Network manager is not available'
            );
        }

        if (!connection.remote.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

        if (
            nick.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'NICK server ID does not match remote server'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                nick.serverId,
                nick.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${nick.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        networkManager.updateClient(
            nick.serverId,
            nick.clientId,
            {
                nick: nick.newNick
            }
        );
const updatedRemoteClient =
    connection.manager.remoteClients.update(
        nick.serverId,
        nick.clientId,
        {
            nick: nick.newNick
        }
    );

        if (!updatedRemoteClient) {
            throw new Error(
                `Unknown remote client in registry: ${nick.clientId}`
            );
        }

        const localClients =
            new Set();

        for (
            const localChannel
            of connection.manager.getLocalChannels()
        ) {
            const networkChannel =
                networkManager.getChannel(
                    localChannel.name
                );

            if (!networkChannel) {
                continue;
            }

            if (
                !networkChannel.clients.has(client)
            ) {
                continue;
            }

            for (
                const localClient
                of localChannel.getMembers()
            ) {
                localClients.add(
                    localClient
                );
            }
        }

        const nickMessage =
            `:${nick.oldNick}!${client.user || '*'}@${client.host || 'localhost'} NICK :${nick.newNick}`;

        for (
            const localClient
            of localClients
        ) {
            localClient.send(
                nickMessage
            );
        }

        console.log(
            `[IRIS] ← NICK ` +
            `${nick.clientId} ` +
            `${nick.oldNick} -> ${nick.newNick}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid NICK:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};