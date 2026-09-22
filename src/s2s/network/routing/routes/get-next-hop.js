
// src/s2s/network-manager/routes/get-next-hop.js

module.exports = function getNextHop(
    manager,
    serverId
) {
    const connection =
        manager.getRoute(serverId);

    if (!connection) {
        return null;
    }

    return (
        connection.remote?.serverId ||
        null
    );
};