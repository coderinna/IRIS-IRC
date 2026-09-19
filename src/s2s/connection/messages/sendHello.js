// src/s2s/connection/messages/sendHello.js

const crypto = require('crypto');

const {
    encodeHello
} = require('../../messages/hello');

module.exports = function sendHello(connection) {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeHello(
            {
                protocolVersion: 1,
                serverId:
                    connection.serverId,

                serverName:
                    connection.serverName,

                capabilities:
                    connection.capabilities
            },
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};