
function flushSendQueue(connection) {
    if (
        connection.sending ||
        connection.socket.destroyed ||
        connection.state === STATES.CLOSED
    ) {
        return;
    }

    connection.sending = true;

    while (connection.sendQueue.length > 0) {
        const frame =
            connection.sendQueue.shift();

        console.log(
            `[IRIS] → SOCKET WRITE ` +
            `type=0x${frame.readUInt8(1).toString(16)} ` +
            `messageId=${frame.subarray(16, 32).toString('hex')} ` +
            `bytes=${frame.length}`
        );

        const canContinue =
            connection.socket.write(frame);

        console.log(
            `[IRIS] → SOCKET WRITE RESULT ` +
            `type=0x${frame.readUInt8(1).toString(16)} ` +
            `result=${canContinue}`
        );

        if (!canContinue) {
            connection.socket.once('drain', () => {
                connection.sending = false;
                flushSendQueue(connection);
            });

            return;
        }
    }

    connection.sending = false;
}


module.exports = 
flushSendQueue
;