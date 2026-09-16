const {
    addServer,
    removeServer,
    getServer,
    getServers,
    setStatus,
    setConnection
} = require('./network/index.js');

class NetworkManager {
    constructor() {
        this.servers = new Map();
    }

    addServer(server) {
        return addServer(
            this,
            server
        );
    }

    removeServer(serverId) {
        return removeServer(
            this,
            serverId
        );
    }

    getServer(serverId) {
        return getServer(
            this,
            serverId
        );
    }

    getServers() {
        return getServers(
            this
        );
    }

    setStatus(serverId, status) {
        return setStatus(
            this,
            serverId,
            status
        );
    }

    setConnection(
        serverId,
        connection
    ) {
        return setConnection(
            this,
            serverId,
            connection
        );
    }

    getStatus(serverId) {
        const server =
            getServer(
                this,
                serverId
            );

        if (!server) {
            return null;
        }

        return server.status;
    }
}

module.exports = NetworkManager;