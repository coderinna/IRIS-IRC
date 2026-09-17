const {
    decodeJoin
} = require('../../messages/join');

module.exports = function handleJoin(
    connection,
    frame
) {
    try {
        const join =
            decodeJoin(frame.payload);

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
            join.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'JOIN server ID does not match remote server'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                join.serverId,
                join.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${join.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        let channel =
            networkManager.getChannel(
                join.channel
            );

        if (!channel) {
            channel =
                networkManager.addChannel({
                    name: join.channel
                });
        }

        networkManager.addClientToChannel(
            join.channel,
            client
        );

        console.log(
            `[IRISH] ← JOIN ` +
            `${join.clientId} ` +
            `${join.channel}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid JOIN:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};