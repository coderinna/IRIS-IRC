const {
    TYPES,
} = require('../../../protocol/frame/frame.js');

function validateFrameType(
    connection,
    frame
) {
    if (
        !frame ||
        !Number.isInteger(frame.type) ||
        frame.type < 0 ||
        frame.type > 0xff
    ) {
        console.warn(
            '[IRIS] Invalid outgoing frame type'
        );

        return false;
    }

    if (
        !Object.values(TYPES).includes(
            frame.type
        )
    ) {
        console.warn(
            `[IRIS] Unknown outgoing frame type: ` +
            `0x${frame.type.toString(16)}`
        );

        return false;
    }

    return true;
}


module.exports = 
validateFrameType
;