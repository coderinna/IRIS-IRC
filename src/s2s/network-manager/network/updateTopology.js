// src/s2s/network-manager/network/updateTopology.js

const getServer =
    require('./getServer');

module.exports = function updateTopology(
    manager,
    serverId,
    parentServerId,
    hopCount
) {
    const server =
        getServer(
            manager,
            serverId
        );

    if (!server) {
        return null;
    }

    if (
        parentServerId === serverId
    ) {
        throw new Error(
            'Server cannot be its own parent'
        );
    }

    if (
        !Number.isInteger(hopCount) ||
        hopCount < 0
    ) {
        throw new Error(
            'Invalid hopCount'
        );
    }

    server.parentServerId =
        parentServerId || null;

    server.hopCount =
        hopCount;

    server.lastSeen =
        Date.now();

    return server;
};