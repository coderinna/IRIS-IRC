// src/s2s/manager/unregisterRemoteServer.js

module.exports = function unregisterRemoteServer(
    manager,
    connection
) {
    if (
        !manager.networkManager ||
        !connection.remote.serverId
    ) {
        return false;
    }

    const server =
        manager.networkManager.getServer(
            connection.remote.serverId
        );

    if (!server) {
        return false;
    }

    if (
        server.connection &&
        server.connection !== connection
    ) {
        return false;
    }

    manager.networkManager.setConnection(
        connection.remote.serverId,
        null
    );

    manager.networkManager.setStatus(
        connection.remote.serverId,
        'offline'
    );

    return true;
};