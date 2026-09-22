
// src/s2s/connection/lifecycle/start.js

const net =
    require('net');

module.exports =
    function start(connection) {
        if (connection.server) {
            throw new Error(
                'S2S listener is already running'
            );
        }

        connection.server =
            net.createServer(
                socket => {
                    connection.handleConnection(
                        socket
                    );
                }
            );

        connection.server.on(
            'error',
            error => {
                console.error(
                    `[S2S] Listener error: ${error.message}`
                );
            }
        );

        connection.server.listen(
            connection.port,
            connection.host,
            () => {
                console.log(
                    `[S2S] Listening on ` +
                    `${connection.host}:${connection.port}`
                );
            }
        );
    };