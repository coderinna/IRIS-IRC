const { STATES } = require('../states.js');

function start(connection) {
    connection.state = STATES.HELLO;

    console.log(
        `[IRIS] Starting handshake as ${connection.serverId}`
    );

    connection.sendHello();
}

module.exports = 
    start
;