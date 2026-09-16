const {
    decodeMessage
} = require('../../messages/message');

module.exports = function handleMessage(
    connection,
    frame
) {
    try {
        const message =
            decodeMessage(frame.payload);

        console.log(
            `[IRISH] ← MESSAGE ` +
            `${message.clientId} ` +
            `→ ${message.target} ` +
            `: ${message.message} ` +
            `from ${message.serverId}`
        );
        return true;


    } catch (error) {
        console.error(
            '[IRISH] Invalid MESSAGE:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};