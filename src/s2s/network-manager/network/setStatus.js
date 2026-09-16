const getServer =
    require('./getServer');

module.exports = function setStatus(
    manager,
    serverId,
    status
) {
    const server =
        getServer(manager, serverId);

    if (!server) {
        throw new Error(
            `Unknown server: ${serverId}`
        );
    }

    server.status = status;

    if (status === 'online') {
        server.lastSeen = Date.now();
    }

    return server;
};