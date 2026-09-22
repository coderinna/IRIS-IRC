
const CURRENT_PROTOCOL_VERSION = 1;

function validateVersion(
    connection,
    frame
) {
    if (
        !frame ||
        !Number.isInteger(frame.version) ||
        frame.version !== CURRENT_PROTOCOL_VERSION
    ) {
        console.warn(
            '[IRIS] Unsupported outgoing protocol version'
        );

        return false;
    }

    return true;
}


module.exports = 
validateVersion
;