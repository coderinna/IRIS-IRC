module.exports = function removeServer(
    manager,
    serverId
) {
    const server =
        manager.servers.get(serverId);

    if (!server) {
        return false;
    }

    manager.servers.delete(serverId);

    return true;
};