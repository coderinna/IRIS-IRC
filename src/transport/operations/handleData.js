'use strict';

function handleData(socket, chunk, buffers, headerSize, maxMessageSize, emit) {
    let buffer = Buffer.concat([
        buffers.get(socket) || Buffer.alloc(0),
        chunk
    ]);

    while (buffer.length >= headerSize) {
        const messageLength = buffer.readUInt32BE(0);

        if (
            messageLength < 1 ||
            messageLength > maxMessageSize
        ) {
            socket.destroy(new Error('Invalid message length'));
            return;
        }

        const frameLength = headerSize + messageLength;

        if (buffer.length < frameLength) {
            break;
        }

        const payload = buffer.subarray(
            headerSize,
            frameLength
        );

        try {
            const message = JSON.parse(payload.toString('utf8'));
            emit('message', message, socket);
        } catch (error) {
            emit('protocolError', error, socket);
            socket.destroy();
            return;
        }

        buffer = buffer.subarray(frameLength);
    }

    buffers.set(socket, buffer);
}

module.exports = handleData;