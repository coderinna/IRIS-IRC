const { STATES } = require('../states.js');

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

module.exports = 
   cleanup
;