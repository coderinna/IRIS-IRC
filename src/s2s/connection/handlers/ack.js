const {
    decodeAck
} = require('../../messages/ack');

module.exports = function handleAck(
    connection,
    frame
) {
    try {
        const ack = decodeAck(frame.payload);

        const acknowledgedMessageId =
            ack.acknowledgedMessageId.toString('hex');

        const pending =
            connection.pendingAcks.get(
                acknowledgedMessageId
            );

        if (!pending) {
            const now = Date.now();

            if (
                connection.unknownAckWindowStartedAt === 0 ||
                now - connection.unknownAckWindowStartedAt >=
                connection.unknownAckWindow
            ) {
                connection.unknownAckWindowStartedAt = now;
                connection.unknownAckCount = 0;
            }

            connection.unknownAckCount++;

            console.error(
                `[IRISH] Unknown ACK ` +
                `${acknowledgedMessageId} ` +
                `(${connection.unknownAckCount}/${connection.maxUnknownAcks})`
            );

            if (
                connection.unknownAckCount >=
                connection.maxUnknownAcks
            ) {
                console.error(
                    '[IRISH] S2S unknown ACK rate limit exceeded'
                );

                connection.socket.destroy();
            }

            return false;
        }

        if (
    !Number.isInteger(pending.type) ||
    typeof pending.sequence !== 'bigint' ||
    !Number.isFinite(pending.createdAt)
) {
    console.error(
        `[IRISH] Invalid pending ACK state: ` +
        `${acknowledgedMessageId}`
    );

    connection.socket.destroy();

    return false;
}

connection.pendingAcks.delete(
    acknowledgedMessageId
);

        console.log(    `[IRISH] ← ACK`  );

        return true;

    } catch (error) {
        console.error(
            '[IRISH] Invalid ACK:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};