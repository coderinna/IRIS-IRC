// src/s2s/connection/messages/sendAuth.js

const crypto = require('crypto');

const {
    encodeAuth
} = require('../../messages/auth');

module.exports = function sendAuth(connection) {
    const remoteServerId =
        connection.remote.serverId;

    if (!remoteServerId) {
        throw new Error(
            'Cannot authenticate: remote server ID is missing'
        );
    }

    if (!connection.trustRegistry) {
        throw new Error(
            'Cannot authenticate: trust registry is not configured'
        );
    }

    const trustedServer =
        connection.trustRegistry.getServer(
            remoteServerId
        );

    if (!trustedServer) {
        throw new Error(
            `Cannot authenticate: server is not trusted: ${remoteServerId}`
        );
    }

    if (
        !connection.trustRegistry.hasPermission(
            remoteServerId,
            'connect'
        )
    ) {
        throw new Error(
            `Cannot connect to server: ${remoteServerId}`
        );
    }

    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeAuth(
            {
                method: 'token',
                serverId: connection.serverId,
                token: trustedServer.secret
            },
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};