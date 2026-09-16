function start(connection) {
    connection.state = STATES.HELLO;

    console.log(
        `[IRISH] Starting handshake as ${connection.serverId}`
    );

    connection.sendHello();
}

function startHandshakeTimeout(connection) {
    connection.handshakeTimeout = setTimeout(() => {
        if (connection.state === STATES.CONNECTED) {
            return;
        }

        console.error(
            '[IRISH] S2S handshake timeout'
        );

        destroy(connection);
    }, 10_000);
}

function cleanup(connection) {
    if (connection.handshakeTimeout) {
        clearTimeout(
            connection.handshakeTimeout
        );

        connection.handshakeTimeout = null;
    }

    if (connection.heartbeatInterval) {
        clearInterval(
            connection.heartbeatInterval
        );

        connection.heartbeatInterval = null;
    }

    if (connection.heartbeatTimeout) {
        clearTimeout(
            connection.heartbeatTimeout
        );

        connection.heartbeatTimeout = null;
    }

    if (connection.pendingAckCleanupInterval) {
        clearInterval(
            connection.pendingAckCleanupInterval
        );

        connection.pendingAckCleanupInterval = null;
    }

    connection.messageIds.clear();
    connection.sendQueue.length = 0;

    connection.state = STATES.CLOSED;
}

function destroy(connection) {
    if (connection.socket.destroyed) {
        return;
    }

    connection.socket.destroy();
}

module.exports = {
    start,
    startHandshakeTimeout,
    cleanup,
    destroy
};