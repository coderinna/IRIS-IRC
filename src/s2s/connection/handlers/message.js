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
        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        const message =
            decodeMessage(
                frame.payload,
                frame.messageId
            );

        const accepted =
            connection.manager.acceptEvent({
                eventId: message.messageId
                    ? message.messageId.toString('hex')
                    : null,
                type: 'MESSAGE',
                serverId: message.serverId,
                clientId: message.clientId,
                payload: message
            });

        if (!accepted) {
            console.log(
                `[IRIS] ↪ DROP duplicate MESSAGE ` +
                `${message.messageId
                    ? message.messageId.toString('hex')
                    : 'unknown'}`
            );

            return true;
        }

        if (!connection.manager.remoteClients) {
            throw new Error(
                'Remote client registry is not available'
            );
        }

        if (!connection.remote.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

const client =
    connection.manager.remoteClients.get(
        message.serverId,
        message.clientId
    );

        if (!client) {
            throw new Error(
                `Unknown remote client: ` +
                `${message.serverId}:${message.clientId}`
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
                message,
                client
            );

        if (!routed) {
            throw new Error(
                `Unable to route MESSAGE to ` +
                `${message.target}`
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

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};