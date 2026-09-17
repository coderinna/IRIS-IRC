const {
    TYPES
} = require('../../protocol/frame');

const {
    STATES
} = require('../states.js');

const ALLOWED_STATES = {
[TYPES.HELLO]: [
    STATES.CONNECTING,
    STATES.HELLO
],

[TYPES.AUTH]: [
    STATES.HELLO,
    STATES.AUTH
],

    [TYPES.SERVER]: [
        STATES.SERVER
    ],

    [TYPES.READY]: [
        STATES.READY
    ],

    [TYPES.CLIENT]: [
        STATES.CONNECTED
    ],

    [TYPES.NICK]: [
        STATES.CONNECTED
    ],

    [TYPES.JOIN]: [
        STATES.CONNECTED
    ],

    [TYPES.PART]: [
        STATES.CONNECTED
    ],

    [TYPES.QUIT]: [
        STATES.CONNECTED
    ],

    [TYPES.MESSAGE]: [
        STATES.CONNECTED
    ],

    [TYPES.PING]: [
        STATES.CONNECTED
    ],

    [TYPES.PONG]: [
        STATES.CONNECTED
    ],

    [TYPES.ACK]: [
        STATES.CONNECTED
    ]
};

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