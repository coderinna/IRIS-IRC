const crypto = require('crypto');

const {
    decodeAuth
} = require('../../messages/auth');

module.exports = function handleAuth(
    connection,
    frame
) {
    try {
        const auth =
            decodeAuth(frame.payload);

        console.log(
            `[IRISH] ← AUTH ${auth.serverId}`
        );

        if (!connection.authToken) {
            throw new Error(
                'IRISH authentication token is not configured'
            );
        }

        if (typeof auth.token !== 'string') {
            throw new Error(
                'IRISH authentication token is invalid'
            );
        }

        const expectedToken =
            Buffer.from(connection.authToken, 'utf8');

        const receivedToken =
            Buffer.from(auth.token, 'utf8');

        if (
            expectedToken.length !== receivedToken.length ||
            !crypto.timingSafeEqual(
                expectedToken,
                receivedToken
            )
        ) {
            console.error(
                `[IRISH] Authentication failed for ${auth.serverId}`
            );

            connection.socket.destroy();
            return false;
        }

        connection.state = 'server';

        connection.sendServer();

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid AUTH:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};