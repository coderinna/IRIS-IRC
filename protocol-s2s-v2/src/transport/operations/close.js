'use strict';

function close(sockets, server) {
    for (const socket of sockets) {
        socket.destroy();
    }

    sockets.clear();

    if (!server) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        server.close(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = close;