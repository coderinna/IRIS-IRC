const {
    decodeClient
} = require('../../messages/client');

module.exports = function handleClient(
    connection,
    frame
) {
    try {
        const client =
            decodeClient(frame.payload);

        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        if (!connection.remote.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

        if (
            client.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'CLIENT server ID does not match remote server'
            );
        }

        connection.manager.networkManager.addClient({
            clientId: client.clientId,
            serverId: client.serverId,
            nick: client.nick,
            user: client.user,
            host: client.host
        });

        console.log(
            `[IRISH] ← CLIENT ` +
            `${client.clientId} ` +
            `${client.nick} ` +
            `from ${client.serverId}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid CLIENT:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};