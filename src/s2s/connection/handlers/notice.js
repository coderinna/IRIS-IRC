// src/s2s/connection/handlers/notice.js

const {
    decodeNotice
} = require('../../messages/notice');

const routeNotice =
    require('../../routing/notice');

module.exports = function handleNotice(
    connection,
    frame
) {
    try {
        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        const notice =
            decodeNotice(
                frame.payload,
                frame.messageId
            );

        const accepted =
            connection.manager.acceptEvent({
                eventId: notice.messageId
                    ? notice.messageId.toString('hex')
                    : null,
                type: 'NOTICE',
                serverId: notice.serverId,
                clientId: notice.clientId,
                payload: notice
            });

        if (!accepted) {
            console.log(
                `[IRIS] ↪ DROP duplicate NOTICE ` +
                `${notice.messageId
                    ? notice.messageId.toString('hex')
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
                notice.serverId,
                notice.clientId
            );

        if (!client) {
            throw new Error(
                `Unknown remote client: ` +
                `${notice.serverId}:${notice.clientId}`
            );
        }

        if (
            client.connection !== connection
        ) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        if (!notice.target) {
            throw new Error(
                'NOTICE target is missing'
            );
        }

        if (!notice.message) {
            throw new Error(
                'NOTICE content is missing'
            );
        }

        const routed =
            routeNotice(
                connection,
                notice,
                client
            );

        if (!routed) {
            throw new Error(
                `Unable to route NOTICE to ${notice.target}`
            );
        }

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid NOTICE:',
            error.message
        );

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};