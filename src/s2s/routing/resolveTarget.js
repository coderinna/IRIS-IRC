module.exports = function resolveTarget(
    networkManager,
    target
) {
    if (!target) {
        return null;
    }

    /*
     * Channel target
     */
    if (target.startsWith('#')) {
        const channel =
            networkManager.getChannel(target);

        if (!channel) {
            return null;
        }

        const clients =
            [...channel.clients];

        return {
            type: 'channel',
            channel,
            clients
        };
    }

    /*
     * Client target
     */
    const client =
        networkManager
            .getClients()
            .find(
                remoteClient =>
                    remoteClient.nick &&
                    remoteClient.nick.toLowerCase() ===
                    target.toLowerCase()
            );

    if (!client) {
        return null;
    }

    const server =
        networkManager.getServer(
            client.serverId
        );

    if (!server) {
        return null;
    }

    return {
        type: 'client',
        client,
        server,
        connection: client.connection
    };
};