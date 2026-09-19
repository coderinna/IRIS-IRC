// src/s2s/manager/servers/propagateServer.js

const {
    STATES
} = require('../../connection/states.js');

module.exports = function propagateServer(
    manager,
    server,
    excludeConnection = null
) {
    console.log(
    `[IRIS] 🔥 PROPAGATE CALLED server=${server?.serverId} manager=${manager?.serverId}`
);

    if (!server?.serverId) {
        return false;
    }

    let propagated = 0;

    console.log(
        `🌐 [IRIS] Propagating server ${server.serverId} ` +
        `from ${manager.serverId}`
    );

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

        console.log(
            `[IRIS] → PROPAGATE ${server.serverId} ` +
            `to ${connection.remote.serverId}`
        );

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
                manager.serverId,

            hopCount:
                server.hopCount + 1
        });

        propagated++;
    }

    console.log(
        `[IRIS] Propagated ${server.serverId} ` +
        `to ${propagated} connection(s)`
    );

    return propagated;
};