
const {
    decodeReady
} = require('../../messages/ready');

const {
    STATES
} = require('../states.js');

module.exports = function handleReady(
    connection,
    frame
) {
    try {
        const ready =
            decodeReady(frame.payload);

        if (
            ready.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'IRISH READY server ID does not match HELLO'
            );
        }

        if (ready.status !== 'ready') {
            throw new Error(
                `Remote server is not ready: ${ready.status}`
            );
        }

        console.log(
            `[IRIS] ← READY ${ready.serverId}`
        );

        connection.state = STATES.CONNECTED;

        if (connection.manager) {
            connection.manager.registerRemoteServer(
                connection
            );

                console.log(
        '[IRIS] Network State:',
        [...connection.manager.getNetworkState().values()]
    );
        }

        connection.startHeartbeat();
        connection.startPendingAckCleanup();

        clearTimeout(
            connection.handshakeTimeout
        );

        connection.handshakeTimeout = null;

        console.log(
            `[IRIS] ✓ CONNECTED ${connection.remote.serverId}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid READY:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};