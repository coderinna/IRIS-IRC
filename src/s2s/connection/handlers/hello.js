const {
    decodeHello
} = require('../../messages/hello');

module.exports = function handleHello(
    connection,
    frame
) {
    try {
        const hello =
            decodeHello(frame.payload);

        connection.remote.serverId =
            hello.serverId;

        connection.remote.serverName =
            hello.serverName;

        connection.remote.capabilities =
            hello.capabilities;

        console.log(
            `[IRISH] ← HELLO ${hello.serverId}`
        );

        connection.state = 'auth';

        connection.sendAuth();

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid HELLO:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};