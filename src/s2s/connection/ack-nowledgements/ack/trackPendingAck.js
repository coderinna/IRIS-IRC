
const trackPendingAck = (
    connection,
    messageId,
    frame
) => {
    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH pending ACK messageId must be a 16-byte Buffer'
        );
    }

    if (!Buffer.isBuffer(frame)) {
        throw new TypeError(
            'IRISH pending ACK frame must be a Buffer'
        );
    }

    const id =
        messageId.toString('hex');

    if (connection.pendingAcks.has(id)) {
        console.error(
            `[IRIS] Duplicate pending ACK messageId: ${id}`
        );

        connection.socket.destroy();

        return false;
    }

    if (
        connection.pendingAcks.size >=
        connection.maxPendingAcks
    ) {
        console.error(
            '[IRIS] S2S pending ACK limit exceeded'
        );

        connection.socket.destroy();

        return false;
    }

    const type =
        frame.readUInt8(1);

    const sequence =
        frame.readBigUInt64BE(8);

    connection.pendingAcks.set(id, {
        createdAt: Date.now(),
        type,
        sequence
    });

    return true;
};



module.exports = 
   trackPendingAck
;