class NetworkState {
    constructor(serverId) {
        this.serverId = serverId;

        this.servers = new Map();

        this.addServer({
            serverId,
            local: true
        });
    }

    addServer(server) {
        if (!server?.serverId) {
            throw new Error(
                'NetworkState server requires serverId'
            );
        }

        this.servers.set(
            server.serverId,
            {
                ...server
            }
        );
    }

    getServer(serverId) {
        return this.servers.get(
            serverId
        ) || null;
    }

    hasServer(serverId) {
        return this.servers.has(
            serverId
        );
    }

    removeServer(serverId) {
        return this.servers.delete(
            serverId
        );
    }

    values() {
        return this.servers.values();
    }

    size() {
        return this.servers.size;
    }
}

module.exports = NetworkState;