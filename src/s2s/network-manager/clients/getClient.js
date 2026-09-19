// src/s2s/network-manager/clients/getClient.js

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