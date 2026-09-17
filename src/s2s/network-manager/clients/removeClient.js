module.exports = function removeClient(
    manager,
    serverId,
    clientId
) {
    if (!serverId || !clientId) {
        return false;
    }

    return manager.clients.delete(
        `${serverId}:${clientId}`
    );
};