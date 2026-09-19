// src/s2s/connection/messages/sendServer.js

const crypto = require('crypto');

const {
    encodeServer
} = require('../../messages/server');

module.exports = function sendServer(connection) {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeServer(
            {
                serverId:
                    connection.serverId,

                serverName:
                    connection.serverName,

                serverVersion:
                    connection.serverVersion,

                serverRole:
                    connection.serverRole,

                parentServerId:
                    connection.parentServerId || null,

                hopCount:
                    connection.hopCount || 0
            },
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};