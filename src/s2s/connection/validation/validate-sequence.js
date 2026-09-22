
// src/s2s/connection/validation/validate-sequence.js

module.exports = function validateSequence(
    connection,
    frame
) {
    if (
        frame.sequence !==
        connection.receiveSequence
    ) {
        console.error(
            `[IRIS] Invalid S2S sequence: ` +
            `expected ${connection.receiveSequence}, ` +
            `received ${frame.sequence}`
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};