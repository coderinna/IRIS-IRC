// src/s2s/connection/messages/sendServer.js

const crypto = require('crypto');

const {
    encodeServer
} = require('../../messages/server');

module.exports = function sendServer(
    connection,
    server = null,
    action = null
) {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const data =
        server || {
            serverId:
                connection.serverId,

            serverName:
                connection.serverName,

            serverVersion:
                connection.serverVersion,

            serverRole:
                connection.serverRole,

            parentServerId:
                null,

            hopCount:
                0
        };

    const frame =
        encodeServer(
            {
                serverId:
                    data.serverId,

                serverName:
                    data.serverName,

                serverVersion:
                    data.serverVersion ||
                    connection.serverVersion,

                serverRole:
                    data.serverRole ||
                    connection.serverRole,

                parentServerId:
                    data.parentServerId || null,

                hopCount:
                    Number.isInteger(
                        data.hopCount
                    )
                        ? data.hopCount
                        : 0
            },
            messageId,
            sequence
        );

   return connection.sendFrame(
    frame,
    action
);
};