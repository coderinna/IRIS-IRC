
// src/s2s/connection/lifecycle/stop.js

module.exports =
    function stop(connection) {
        if (!connection.server) {
            return;
        }

        connection.server.close();

        connection.server = null;

        console.log(
            '[S2S] Listener stopped'
        );
    };