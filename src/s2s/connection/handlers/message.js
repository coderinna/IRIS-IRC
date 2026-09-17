const {
    decodeMessage
} = require('../../messages/message');

const routeMessage =
    require('../../routing/message');

module.exports = function handleMessage(
    connection,
    frame
) {
    try {
        const message =
            decodeMessage(frame.payload);

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
            message.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'MESSAGE server ID does not match remote server'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        const client =
            networkManager.getClient(
                message.serverId,
                message.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${message.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        if (!message.target) {
            throw new Error(
                'MESSAGE target is missing'
            );
        }

        if (!message.message) {
            throw new Error(
                'MESSAGE content is missing'
            );
        }

        const routed =
            routeMessage(
                connection,
                message
            );

        if (!routed) {
            throw new Error(
                `Unable to route MESSAGE to ${message.target}`
            );
        }

        console.log(
            `[IRIS] ← MESSAGE ` +
            `${client.nick} → ` +
            `${message.target}: ` +
            `${message.message}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid MESSAGE:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};