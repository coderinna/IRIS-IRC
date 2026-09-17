const {
    decodeQuit
} = require('../../messages/quit');

module.exports = function handleQuit(
    connection,
    frame
) {
    try {
        const quit =
            decodeQuit(frame.payload);

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
            quit.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'QUIT server ID does not match remote server'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                quit.serverId,
                quit.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${quit.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        for (
            const channel
            of networkManager.getChannels()
        ) {
            if (channel.clients.has(client)) {
                networkManager.removeClientFromChannel(
                    channel.name,
                    client
                );
            }
        }

        networkManager.removeClient(
            quit.serverId,
            quit.clientId
        );

        console.log(
            `[IRIS] ← QUIT ` +
            `${quit.clientId} ` +
            `${quit.reason || ''}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid QUIT:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};