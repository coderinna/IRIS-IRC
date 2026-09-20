

const {
  ALLOWED_STATES
} = require('../allowed-states.js.js');

const validateState = (
    connection,
    frame
) => {
    const allowedStates =
        ALLOWED_STATES[frame.type];

    if (!allowedStates) {
        console.error(
            `[IRIS] Frame type not allowed: ` +
            `0x${frame.type.toString(16)}`
        );

        connection.socket.destroy();

        return false;
    }

    if (
        !allowedStates.includes(
            connection.state
        )
    ) {
        console.error(
            `[IRIS] Frame 0x${frame.type.toString(16)} ` +
            `not allowed in state ${connection.state}`
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};

module.exports = {
    ALLOWED_STATES,
    validateState
};