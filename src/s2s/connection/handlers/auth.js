const {
    decodeAuth
} = require('../../messages/auth');

const {
    STATES
} = require('../states.js');

const authenticateServer =
    require('../../security/authenticate-server');

module.exports = function handleAuth(
    connection,
    frame
) {
    try {
        const auth =
            decodeAuth(frame.payload);

        if (
            auth.serverId !==
            connection.remote.serverId
        ) {
            throw new Error(
                'S2S AUTH server ID mismatch'
            );
        }

        if (!connection.trustRegistry) {
            throw new Error(
                'S2S trust registry is not configured'
            );
        }

        const result = authenticateServer(
            connection.trustRegistry,
            auth.serverId,
            auth.token
        );

        if (!result.authenticated) {
            throw new Error(
                `S2S authentication rejected: ${result.reason}`
            );
        }

        connection.authenticated = true;

        connection.state = STATES.SERVER;

        console.log(
            `[IRIS] ✓ AUTHENTICATED ${auth.serverId}`
        );

        connection.sendServer();

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Authentication failed:',
            error.message
        );

        connection.authenticated = false;
        connection.socket.destroy();

        return false;
    }
};