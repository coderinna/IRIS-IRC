// src/s2s/network/routing/routes/get-route.js

module.exports = function getRoute(
    resolver,
    serverId
) {
    if (!serverId) {
        return null;
    }

    const manager =
        resolver.manager;

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