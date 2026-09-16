const crypto = require('crypto');

const {
    STATES
} = require('../states.js');

const {
    encodePing
} = require('../../messages/ping');

const startHeartbeat = connection => {
    if (connection.heartbeatInterval) {
        return;
    }

    connection.heartbeatInterval = setInterval(() => {
        if (
            connection.state !== STATES.CONNECTED ||
            connection.socket.destroyed
        ) {
            return;
        }

        const messageId =
            crypto.randomBytes(16);

        const sequence =
            connection.nextSendSequence();

        const ping = encodePing(
            messageId,
            sequence
        );

        connection.sendFrame(ping);

        console.log(
            `[IRISH] → PING ${connection.remote.serverId}`
        );

        if (connection.heartbeatTimeout) {
            clearTimeout(
                connection.heartbeatTimeout
            );
        }

        connection.heartbeatTimeout =
            setTimeout(() => {
                console.error(
                    `[IRISH] S2S heartbeat timeout: ` +
                    `${connection.remote.serverId}`
                );

                connection.socket.destroy();
            }, connection.heartbeatTimeoutMs);
    }, connection.heartbeatIntervalMs);
};

module.exports = {
    startHeartbeat
};