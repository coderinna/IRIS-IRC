
// src/s2s/manager/servers/registerIntroducedServer.js

// Tämä on nyt se varsinainen kohta, jossa IRIS alkaa muuttua monipalvelinverkoksi. 🌸


module.exports = function registerIntroducedServer(
    manager,
    connection,
    server
) {
    if (!server?.serverId) {
        return false;
    }

    if (server.serverId === manager.serverId) {
        return false;
    }

    if (!server.parentServerId) {
        return false;
    }

    const existing =
        manager.networkManager.getServer(
            server.serverId
        );

    if (existing) {
        console.error(
            `[IRIS] Server collision: ${server.serverId}`
        );

        return false;
    }

    if (
        server.parentServerId !==
        connection.remote.serverId
    ) {
        console.error(
            `[IRIS] Invalid topology parent: ` +
            `${server.serverId} → ${server.parentServerId}`
        );

        return false;
    }

    if (
        !Number.isInteger(server.hopCount) ||
        server.hopCount < 1
    ) {
        return false;
    }

    const entry =
        manager.networkManager.addServer({
            serverId:
                server.serverId,

            serverName:
                server.serverName,

            role:
                server.serverRole,

            parentServerId:
                server.parentServerId,

            hopCount:
                server.hopCount
        });

    manager.networkManager.setStatus(
        entry.serverId,
        'online'
    );

    manager.networkState.addServer({
        serverId:
            entry.serverId,

        serverName:
            entry.serverName,

        role:
            entry.role,

        local: false,

        connection: null,

        parentServerId:
            entry.parentServerId,

        hopCount:
            entry.hopCount
    });

    console.log(
        `[IRIS] Topology: ` +
        `${entry.parentServerId} → ` +
        `${entry.serverId} ` +
        `(hop ${entry.hopCount})`
    );

    return true;
};