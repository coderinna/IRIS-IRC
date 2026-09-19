// src/s2s/connection/messages/sendAuth.js

const crypto = require('crypto');

const {
    encodeAuth
} = require('../../messages/auth');

module.exports = function sendAuth(connection) {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeAuth(
            {
                method: 'token',
                serverId:
                    connection.serverId,

                token:
                    connection.authToken
            },
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};