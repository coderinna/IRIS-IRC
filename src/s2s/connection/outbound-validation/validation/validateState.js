
const {
  ALLOWED_STATES
} = require('../../allowed-states.js.js');

function validateState(
    connection,
    frame
) {

    const states =
        ALLOWED_STATES[frame.type];

    if (!states) {
        console.warn(
            '[IRIS] No outbound state policy for frame'
        );

        return false;
    }

    if (
        !states.includes(
            connection.state
        )
    ) {
        console.warn(
            `[IRIS] Blocked outbound frame ` +
            `0x${frame.type.toString(16)} ` +
            `in state ${connection.state}`
        );

        return false;
    }

    return true;
}

module.exports = {
validateState
};