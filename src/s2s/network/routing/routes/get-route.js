
// src/s2s/network-manager/routes/get-route.js

module.exports = function getRoute(
    manager,
    serverId
) {
    if (!serverId) {
        return null;
    }

    if (
        serverId ===
        manager.serverId
    ) {
        return null;
    }

    const server =
        manager.networkState.getServer(
            serverId
        );

    if (!server) {
        return null;
    }

    if (server.connection) {
        return server.connection;
    }

    const parentServerId =
        server.parentServerId;

    if (!parentServerId) {
        return null;
    }

    const parent =
        manager.networkState.getServer(
            parentServerId
        );

    if (!parent) {
        return null;
    }

    return parent.connection || null;
};