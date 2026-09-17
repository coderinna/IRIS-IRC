const {
    decodePart
} = require('../../messages/part');

module.exports = function handlePart(
    connection,
    frame
) {
    try {
        const part =
            decodePart(frame.payload);

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
            part.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'PART server ID does not match remote server'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                part.serverId,
                part.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${part.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        const channel =
            networkManager.getChannel(
                part.channel
            );

        if (!channel) {
            throw new Error(
                `Unknown remote channel: ${part.channel}`
            );
        }

        if (!channel.clients.has(client)) {
            throw new Error(
                `Remote client is not in channel: ${part.channel}`
            );
        }

        networkManager.removeClientFromChannel(
            part.channel,
            client
        );

        console.log(
            `[IRISH] ← PART ` +
            `${part.clientId} ` +
            `${part.channel}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid PART:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};