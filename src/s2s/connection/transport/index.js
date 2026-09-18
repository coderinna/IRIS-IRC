const { TYPES } =  require('../../protocol/frame');
const {   STATES } = require('../states.js');

function setupSocket(connection) {
    connection.socket.on('data', chunk => {
        connection.handleData(chunk);
    });

connection.socket.on('close', () => {
    if (connection.manager) {
        connection.manager.networkManager
            .removeClientsByConnection(
                connection
            );

        connection.manager.unregisterRemoteServer(
            connection
        );

        connection.manager.removeConnection(
            connection
        );
    }

    connection.cleanup();

    console.log(
        `[IRIS] Connection closed: ${
            connection.remote.serverId || 'unknown'
        }`
    );
});

    connection.socket.on('error', error => {
        console.error(
            '[IRIS] Socket error:',
            error.message
        );
    });
}

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

function flushSendQueue(connection) {
    if (
        connection.sending ||
        connection.socket.destroyed ||
        connection.state === STATES.CLOSED
    ) {
        return;
    }

    connection.sending = true;

    while (connection.sendQueue.length > 0) {
        const frame =
            connection.sendQueue.shift();

        console.log(
            `[IRIS] → SOCKET WRITE ` +
            `type=0x${frame.readUInt8(1).toString(16)} ` +
            `messageId=${frame.subarray(16, 32).toString('hex')} ` +
            `bytes=${frame.length}`
        );

        const canContinue =
            connection.socket.write(frame);

        console.log(
            `[IRIS] → SOCKET WRITE RESULT ` +
            `type=0x${frame.readUInt8(1).toString(16)} ` +
            `result=${canContinue}`
        );

        if (!canContinue) {
            connection.socket.once('drain', () => {
                connection.sending = false;
                flushSendQueue(connection);
            });

            return;
        }
    }

    connection.sending = false;
}

function handleData(connection, chunk) {
    if (
        chunk.length >
        connection.maxChunkSize
    ) {
        console.error(
            `[IRIS] S2S data chunk too large: ${chunk.length} bytes`
        );

        connection.socket.destroy();

        return;
    }

    let frames;

    try {
        frames =
            connection.parser.push(chunk);
    } catch (error) {
        console.error(
            '[IRIS] Parser error:',
            error.message
        );

        connection.socket.destroy();

        return;
    }

    for (const frame of frames) {
        connection.handleFrame(frame);
    }
}

module.exports = {
    setupSocket,
    sendFrame,
    flushSendQueue,
    handleData
};