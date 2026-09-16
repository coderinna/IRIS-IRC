const crypto = require('crypto');

const {
    decodePing
} = require('../../messages/ping');

const {
    encodePong
} = require('../../messages/pong');

module.exports = function handlePing(
    connection,
    frame
) {
    try {
        decodePing(frame.payload);

        const messageId = crypto.randomBytes(16);
        const sequence = connection.nextSendSequence();

        const pong = encodePong(
            messageId,
            sequence
        );

        connection.sendFrame(pong);

        console.log(
            `[IRISH] ← PING → PONG ${connection.remote.serverId}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid PING:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};