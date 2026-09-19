// src/s2s/manager/registerRemoteServer.js

module.exports = function registerRemoteServer(
    manager,
    connection
) {
    if (!connection?.remote?.serverId) {
        return false;
    }

    const serverId =
        connection.remote.serverId;

    if (serverId === manager.serverId) {
        return false;
    }

    const existing =
        manager.networkManager.getServer(
            serverId
        );

    if (existing) {
        if (
            existing.connection &&
            existing.connection !== connection
        ) {
            console.error(
                `[IRIS] Server collision: ${serverId}`
            );

            return false;
        }

        manager.networkManager.setConnection(
            serverId,
            connection
        );

        manager.networkManager.setStatus(
            serverId,
            'online'
        );

        return true;
    }

    const server =
        manager.networkManager.addServer({
            serverId,
            serverName:
                connection.remote.serverName,
            role:
                connection.remote.serverRole,
            parentServerId:
                manager.serverId,
            hopCount: 1
        });

    manager.networkManager.setConnection(
        server.serverId,
        connection
    );

    manager.networkManager.setStatus(
        server.serverId,
        'online'
    );

    manager.networkState.addServer({
        serverId:
            server.serverId,

        serverName:
            server.serverName,

        role:
            server.role,

        local: false,

        connection,

        parentServerId:
            server.parentServerId,

        hopCount:
            server.hopCount
    });

    console.log(
        `[IRIS] Topology: ` +
        `${server.parentServerId} → ` +
        `${server.serverId} ` +
        `(hop ${server.hopCount})`
    );

    return true;
};