const startPendingAckCleanup = connection => {
    if (connection.pendingAckCleanupInterval) {
        return;
    }

    connection.pendingAckCleanupInterval = setInterval(() => {
        const now = Date.now();

        for (const [
            messageId,
            pending
        ] of connection.pendingAcks) {
            if (
                now - pending.createdAt >=
                connection.pendingAckTimeout
            ) {
                connection.pendingAcks.delete(
                    messageId
                );

                console.error(
                    `[IRISH] S2S ACK timeout: ${messageId}`
                );
            }
        }
    }, 5_000);
};

const trackPendingAck = (
    connection,
    messageId
) => {
    const id = messageId.toString('hex');

    if (
        connection.pendingAcks.size >=
        connection.maxPendingAcks
    ) {
        console.error(
            '[IRISH] S2S pending ACK limit exceeded'
        );

        connection.socket.destroy();

        return false;
    }

    connection.pendingAcks.set(id, {
        createdAt: Date.now()
    });

    return true;
};

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

    if (!trackPendingAck(connection, messageId)) {
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

module.exports = {
    startPendingAckCleanup,
    trackPendingAck,
    sendTrackedFrame
};