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

        const client =
            connection.manager.networkManager.getClient(
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

        connection.manager.networkManager.updateClient(
            nick.serverId,
            nick.clientId,
            {
                nick: nick.newNick
            }
        );

        console.log(
            `[IRISH] ← NICK ` +
            `${nick.clientId} ` +
            `${nick.oldNick} -> ${nick.newNick}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid NICK:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};