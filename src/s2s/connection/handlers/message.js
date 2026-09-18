const {
    decodeMessage
} = require('../../messages/message');

const routeMessage =
    require('../../routing/message');

module.exports = function handleMessage(
    connection,
    frame
) {
  try {

    if (!connection.manager) {
        throw new Error(
            'S2S manager is not available'
        );
    }

    const message =
        decodeMessage(
            frame.payload,
            frame.messageId
        );

    const accepted =
        connection.manager.acceptEvent({
            eventId: message.messageId
                ? message.messageId.toString('hex')
                : null,
            type: 'MESSAGE',
            serverId: message.serverId,
            clientId: message.clientId,
            payload: message
        });

    if (!accepted) {
        console.log(
            `[IRIS] ↪ DROP duplicate MESSAGE ` +
            `${message.messageId
                ? message.messageId.toString('hex')
                : 'unknown'}`
        );

        return true;
    }
} catch (error) {
        console.error(
            '[IRIS] Invalid MESSAGE:',
            error.message
        );

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};