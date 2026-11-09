const { STATES } = require('../states.js');

const sendFrame =
    require('./sendFrame.js');

const flushSendQueue =
    require('./flushSendQueue.js');

const handleData =
    require('./handleData.js');


function setupSocket(connection) {
    connection.socket.on('data', chunk => {
        console.log(
            `[IRIS] ← TCP DATA ` +
            `local=${connection.socket.localPort} ` +
            `remote=${connection.socket.remotePort} ` +
            `bytes=${chunk.length} ` +
            `firstByte=0x${chunk[0]?.toString(16)}`
        );

        connection.handleData(chunk);
    });

    connection.socket.on('close', () => {
        if (connection.manager) {
            connection.manager.networkManager
                .removeClientsByConnection(
                    connection
                );

            connection.manager.remoteClients
                .removeByConnection(
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


module.exports = {
    setupSocket,
    sendFrame,
    flushSendQueue,
    handleData
};