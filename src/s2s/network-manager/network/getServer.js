module.exports = function getServer(
    manager,
    serverId
) {
    return manager.servers.get(serverId) || null;
};