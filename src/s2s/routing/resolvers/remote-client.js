
// src/s2s/routing/resolvers/remote-client.js

module.exports = function resolveRemoteClient(
    target,
    remoteClients,
    networkManager
) {
    const remoteClient =
        remoteClients
            ? remoteClients.getByNick(target)
            : null;

    console.log(
        `[ROUTE] REMOTE LOOKUP target=${target} ` +
        `found=${!!remoteClient}`
    );

    if (remoteClient) {
        console.log(
            `[ROUTE] REMOTE CLIENT ` +
            `nick=${remoteClient.nick} ` +
            `clientId=${remoteClient.clientId} ` +
            `serverId=${remoteClient.serverId} ` +
            `hasConnection=${!!remoteClient.connection}`
        );
    }

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