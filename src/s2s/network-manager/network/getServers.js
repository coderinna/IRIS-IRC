module.exports = function getServers(
    manager
) {
    return Array.from(
        manager.servers.values()
    );
};