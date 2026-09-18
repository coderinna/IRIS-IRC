module.exports = function resolveTarget(
    networkManager,
    remoteClients,
    getLocalClientByNick,
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

        return {
            type: 'channel',
            channel,
            clients: [...channel.clients]
        };
    }

    /*
     * Local client
     */
    const localClient =
        getLocalClientByNick
            ? getLocalClientByNick(target)
            : null;

    if (localClient) {
        return {
            type: 'local-client',
            client: localClient
        };
    }

    /*
     * Remote client
     */
    const remoteClient =
        remoteClients
            ? remoteClients.getByNick(target)
            : null;

    if (!remoteClient) {
        return null;
    }

    const server =
        networkManager.getServer(
            remoteClient.serverId
        );

    if (!server) {
        return null;
    }

    return {
        type: 'remote-client',
        client: remoteClient,
        server,
        connection: remoteClient.connection
    };
};