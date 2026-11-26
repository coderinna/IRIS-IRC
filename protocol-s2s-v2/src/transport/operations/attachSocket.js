'use strict';

function attachSocket(socket, sockets, buffer, handleData, emit) {
    sockets.add(socket);
    buffer.set(socket, Buffer.alloc(0));

    socket.on('data', chunk => {
        handleData(socket, chunk);
    });

    socket.on('close', () => {
        sockets.delete(socket);
        buffer.delete(socket);
        emit('disconnect', socket);
    });

    socket.on('error', error => {
        emit('socketError', error);
    });

    emit('connection', socket);
}

module.exports = attachSocket;