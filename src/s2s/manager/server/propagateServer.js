// src/s2s/manager/servers/propagateServer.js

const {
    STATES
} = require('../../connection/states.js');

module.exports = function propagateServer(
    manager,
    server,
    excludeConnection = null
) {
    if (!server?.serverId) {
        return false;
    }

    let propagated = 0;

    for (const connection of manager.connections) {
        if (
            !connection ||
            connection === excludeConnection
        ) {
            continue;
        }

        if (!connection.remote?.serverId) {
            continue;
        }

        if (
            connection.state !==
            STATES.CONNECTED
        ) {
            continue;
        }

        if (
            connection.remote.serverId ===
            server.serverId
        ) {
            continue;
        }

        connection.sendServer({
            serverId:
                server.serverId,

            serverName:
                server.serverName,

            serverVersion:
                server.serverVersion,

            serverRole:
                server.role,

            parentServerId:
                server.parentServerId,

            hopCount:
                server.hopCount + 1
        });

        propagated++;
    }

    return propagated;
};