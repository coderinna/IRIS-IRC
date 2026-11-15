
const trackPendingAck =
    require('./trackPendingAck.js');

const FRAME_ACTIONS = {
    0x10: 'sync', // CLIENT
    0x17: 'sync', // CHANNEL_STATE

    0x11: 'route', // NICK
    0x12: 'route', // JOIN
    0x13: 'route', // PART
    0x14: 'route', // QUIT
    0x15: 'route', // MESSAGE
    0x16: 'route', // NOTICE
    0x18: 'route', // MODE
    0x19: 'route'  // TOPIC
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

    if (!Buffer.isBuffer(frame) || frame.length < 2) {
        return false;
    }

    const id = messageId.toString('hex');

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
        const frameType = frame.readUInt8(1);
        const action = FRAME_ACTIONS[frameType] || null;

        const sent = connection.sendFrame(
            frame,
            action
        );

        if (!sent) {
            connection.pendingAcks.delete(id);
        }

        return sent;

    } catch (error) {
        connection.pendingAcks.delete(id);
        throw error;
    }
};

module.exports = sendTrackedFrame;
