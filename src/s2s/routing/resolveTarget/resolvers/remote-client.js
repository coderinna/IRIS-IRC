
// src/s2s/routing/resolveTarget/resolvers/remote-client.js

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
        console.log(
            `[ROUTE] REMOTE CLIENT NOT FOUND ` +
            `target=${target}`
        );

        return null;
    }

    const server =
        networkManager.getServer(
            remoteClient.serverId
        );

    console.log(
        `[ROUTE] REMOTE SERVER ` +
        `serverId=${remoteClient.serverId} ` +
        `found=${!!server}`
    );

    if (!server) {
        return null;
    }

    console.log(
        `[ROUTE] REMOTE ROUTE ` +
        `serverId=${remoteClient.serverId} ` +
        `connectionState=${remoteClient.connection?.state}`
    );

    return {
        type: 'remote-client',
        client: remoteClient,
        server,
        connection: remoteClient.connection
    };
};