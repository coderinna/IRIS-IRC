class NetworkManager {
    constructor() {
        this.servers = new Map();
    }

    addServer(server) {
        if (!server || !server.serverId) {
            throw new Error('Invalid server definition');
        }

        if (this.servers.has(server.serverId)) {
            throw new Error(`Server already exists: ${server.serverId}`);
        }

        const entry = {
            serverId: server.serverId,
            serverName: server.serverName || server.serverId,
            host: server.host,
            port: server.port,
            role: server.role || 'server',
            status: 'offline',
            connection: null,
            lastSeen: null
        };

        this.servers.set(entry.serverId, entry);

        return entry;
    }

    removeServer(serverId) {
        const server = this.servers.get(serverId);

        if (!server) {
            return false;
        }

        this.servers.delete(serverId);

        return true;
    }

    getServer(serverId) {
        return this.servers.get(serverId) || null;
    }

    getServers() {
        return Array.from(this.servers.values());
    }

    setStatus(serverId, status) {
        const server = this.getServer(serverId);

        if (!server) {
            throw new Error(`Unknown server: ${serverId}`);
        }

        server.status = status;

        if (status === 'online') {
            server.lastSeen = Date.now();
        }

        return server;
    }

    setConnection(serverId, connection) {
        const server = this.getServer(serverId);

        if (!server) {
            throw new Error(`Unknown server: ${serverId}`);
        }

        server.connection = connection;

        return server;
    }

    getStatus(serverId) {
        const server = this.getServer(serverId);

        if (!server) {
            return null;
        }

        return server.status;
    }
}

module.exports = NetworkManager;