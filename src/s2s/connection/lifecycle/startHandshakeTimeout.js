const { STATES } = require('../states.js');

function startHandshakeTimeout(connection) {
    connection.handshakeTimeout = setTimeout(() => {
        if (connection.state === STATES.CONNECTED) {
            return;
        }

        console.error(
            '[IRIS] S2S handshake timeout'
        );

        destroy(connection);
    }, 10_000);
}

module.exports = {
   startHandshakeTimeout
};