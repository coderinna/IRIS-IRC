// src/s2s/connection/messages/sendReady.js

const crypto = require('crypto');

const {
    encodeReady
} = require('../../messages/ready');

module.exports = function sendReady(connection) {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeReady(
            {
                serverId:
                    connection.serverId,

                status: 'ready'
            },
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};