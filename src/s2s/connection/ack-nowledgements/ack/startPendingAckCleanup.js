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
                    `[IRIS] S2S ACK timeout: ${messageId}`
                );
            }
        }
    }, 5_000);
};


module.exports = 
    startPendingAckCleanup
;