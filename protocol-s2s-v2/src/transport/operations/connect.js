'use strict';

const net = require('net');

function connect(port, host, attachSocket) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ port, host });

        const onError = error => {
            socket.destroy();
            reject(error);
        };

        socket.once('error', onError);

        socket.once('connect', () => {
            socket.removeListener('error', onError);
            attachSocket(socket);
            resolve(socket);
        });
    });
}

module.exports = connect;