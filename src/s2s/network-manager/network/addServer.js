// src/s2s/network-manager/network/addServer.js

module.exports = function addServer(
    manager,
    server
) {
    if (!server || !server.serverId) {
        throw new Error(
            'Invalid server definition'
        );
    }

    if (manager.servers.has(server.serverId)) {
        throw new Error(
            `Server already exists: ${server.serverId}`
        );
    }

    const entry = {
        serverId: server.serverId,
        serverName:
            server.serverName || server.serverId,
        host: server.host,
        port: server.port,
        role: server.role || 'server',
        status: 'offline',
        connection: null,
        lastSeen: null,
        parentServerId:
            server.parentServerId || null,
        hopCount:
            Number.isInteger(server.hopCount)
                ? server.hopCount
                : 0
    };

    manager.servers.set(
        entry.serverId,
        entry
    );

    return entry;
};