

const MAX_SEQUENCE =
    0xffffffffffffffffn;


function validateSequence(
    connection,
    frame
) {
    if (
        !frame ||
        typeof frame.sequence !== 'bigint' ||
        frame.sequence < 0n ||
        frame.sequence > MAX_SEQUENCE
    ) {
        console.warn(
            '[IRIS] Invalid outgoing sequence'
        );

        return false;
    }

    return true;
}


module.exports = {
validateSequence
};