'use strict';

const net = require('net');

function listen(port, host, attachSocket, emit, setServer, setPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer(socket => {
            attachSocket(socket);
        });

        setServer(server);

        server.once('error', reject);

        server.listen(port, host, () => {
            server.removeListener('error', reject);

            const address = server.address();
            setPort(address.port);

            resolve(address);
            emit('listening', address);
        });
    });
}

module.exports = listen;