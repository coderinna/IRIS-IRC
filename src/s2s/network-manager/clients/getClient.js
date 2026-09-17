module.exports = function getClient(
    manager,
    serverId,
    clientId
) {
    if (!serverId || !clientId) {
        return null;
    }

    return manager.clients.get(
        `${serverId}:${clientId}`
    ) || null;
};