// src/s2s/network/routing/route-resolver.js

class RouteResolver {
    constructor(manager) {
        this.manager = manager;
    }

    getRoute(serverId) {
        if (!serverId) {
            return null;
        }

        if (serverId === this.manager.serverId) {
            return null;
        }

        const server =
            this.manager.networkState.getServer(
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
            this.manager.networkState.getServer(
                parentServerId
            );

        if (!parent) {
            return null;
        }

        return parent.connection || null;
    }

    getNextHop(serverId) {
        const connection =
            this.getRoute(serverId);

        if (!connection) {
            return null;
        }

        return connection.remote?.serverId || null;
    }

    hasRoute(serverId) {
        return this.getRoute(serverId) !== null;
    }
}

module.exports = RouteResolver;