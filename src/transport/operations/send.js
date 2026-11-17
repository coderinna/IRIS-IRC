'use strict';

function send(socket, message, headerSize, maxMessageSize) {
    if (!socket || socket.destroyed) {
        throw new Error('Socket is not connected');
    }

    const payload = Buffer.from(JSON.stringify(message));

    if (
        payload.length < 1 ||
        payload.length > maxMessageSize
    ) {
        throw new Error('Message size out of range');
    }

    const header = Buffer.alloc(headerSize);
    header.writeUInt32BE(payload.length, 0);

    socket.write(Buffer.concat([header, payload]));
}

module.exports = send;