
const {   STATES } = require('../states.js');

function sendFrame(connection, frame) {
    if (
        connection.socket.destroyed ||
        connection.state === STATES.CLOSED
    ) {
        return false;
    }

    if (!Buffer.isBuffer(frame)) {
        throw new TypeError(
            'IRISH frame must be a Buffer'
        );
    }

    if (
        connection.sendQueue.length >=
        connection.maxSendQueue
    ) {
        console.error(
            '[IRIS] S2S send queue limit exceeded'
        );

        connection.socket.destroy();

        return false;
    }

    const type =
        frame.readUInt8(1);

    const messageId =
        frame.subarray(16, 32).toString('hex');

    console.log(
        `[IRIS] → QUEUE ` +
        `remote=${connection.remote.serverId} ` +
        `type=0x${type.toString(16)} ` +
        `messageId=${messageId} ` +
        `socket=${connection.socket.localPort}->${connection.socket.remotePort}`
    );

    connection.sendQueue.push(frame);

    flushSendQueue(connection);

    return true;
}

module.exports = {
 sendFrame
};