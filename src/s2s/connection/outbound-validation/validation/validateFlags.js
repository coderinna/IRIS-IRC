
function validateVersion(
    connection,
    frame
) {
    if (
        !frame ||
        !Number.isInteger(frame.flags) ||
        frame.flags < 0 ||
        frame.flags > 0xffff
    ) {
        console.warn(
            '[IRIS] Invalid outgoing frame flags'
        );

        return false;
    }

    return true;
}


module.exports = 
validateVersion
;