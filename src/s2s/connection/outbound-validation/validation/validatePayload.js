const {
    MAX_PAYLOAD_SIZE,
} = require('../../../protocol/frame/frame.js');

function validatePayload(
    connection,
    frame
) {
    if (
        !frame ||
        !Buffer.isBuffer(frame.payload)
    ) {
        console.warn(
            '[IRIS] Invalid outgoing frame payload'
        );

        return false;
    }

    if (
        frame.payload.length >
        MAX_PAYLOAD_SIZE
    ) {
        console.warn(
            '[IRIS] Outgoing frame payload ' +
            'exceeds maximum size'
        );

        return false;
    }

    return true;
}


module.exports = 
validatePayload
;