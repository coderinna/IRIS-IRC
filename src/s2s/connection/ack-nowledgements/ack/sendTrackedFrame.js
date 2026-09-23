
const trackPendingAck =
    require('./trackPendingAck.js');

const sendTrackedFrame = (
    connection,
    frame,
    messageId
) => {
    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH tracked frame messageId must be a 16-byte Buffer'
        );
    }

    const id =
        messageId.toString('hex');

    if (
        !trackPendingAck(
            connection,
            messageId,
            frame
        )
    ) {
        return false;
    }

    try {
        const sent =
            connection.sendFrame(frame);

        if (!sent) {
            connection.pendingAcks.delete(id);
        }

        return sent;

    } catch (error) {
        connection.pendingAcks.delete(id);
        throw error;
    }
};

module.exports = 
  sendTrackedFrame
;