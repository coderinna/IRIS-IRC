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
        lastSeen: null
    };

    manager.servers.set(
        entry.serverId,
        entry
    );

    return entry;
};