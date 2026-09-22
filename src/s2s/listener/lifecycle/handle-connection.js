
// src/s2s/listener/handlers/handle-connection.js

const {
    S2SConnection
} = require('../../connection/connection');


module.exports =
    function handleConnection(
        listener,
        socket
    ) {
        console.log(
            `[S2S] Incoming connection from ` +
            `${socket.remoteAddress}:${socket.remotePort}`
        );

        socket.setNoDelay(true);

        const connection =
            new S2SConnection(
                socket,
                listener.connectionOptions
            );

        if (listener.manager) {
            listener.manager.addConnection(
                connection
            );
        }

        connection.start();
    };