const {
    TYPES,
    MAX_PAYLOAD_SIZE
} = require('../../protocol/frame');

const {
    STATES
} = require('../states.js');

const CURRENT_PROTOCOL_VERSION = 1;

const MAX_SEQUENCE =
    0xffffffffffffffffn;


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
            '[IRISH] Unsupported outgoing protocol version'
        );

        return false;
    }

    return true;
}


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
            '[IRISH] Invalid outgoing frame type'
        );

        return false;
    }

    if (
        !Object.values(TYPES).includes(
            frame.type
        )
    ) {
        console.warn(
            `[IRISH] Unknown outgoing frame type: ` +
            `0x${frame.type.toString(16)}`
        );

        return false;
    }

    return true;
}


function validateFlags(
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
            '[IRISH] Invalid outgoing frame flags'
        );

        return false;
    }

    return true;
}


function validatePayload(
    connection,
    frame
) {
    if (
        !frame ||
        !Buffer.isBuffer(frame.payload)
    ) {
        console.warn(
            '[IRISH] Invalid outgoing frame payload'
        );

        return false;
    }

    if (
        frame.payload.length >
        MAX_PAYLOAD_SIZE
    ) {
        console.warn(
            '[IRISH] Outgoing frame payload ' +
            'exceeds maximum size'
        );

        return false;
    }

    return true;
}


function validateMessageId(
    connection,
    frame
) {
    if (
        !frame ||
        !Buffer.isBuffer(frame.messageId) ||
        frame.messageId.length !== 16
    ) {
        console.warn(
            '[IRISH] Invalid outgoing message ID'
        );

        return false;
    }

    return true;
}


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
            '[IRISH] Invalid outgoing sequence'
        );

        return false;
    }

    return true;
}


function validateState(
    connection,
    frame
) {
    const allowedStates = {

        [TYPES.HELLO]: [
            STATES.HELLO
        ],

        [TYPES.AUTH]: [
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

        [TYPES.NOTICE]: [
            STATES.CONNECTED
        ],

        [TYPES.PING]: [
            STATES.READY,
            STATES.CONNECTED
        ],

        [TYPES.PONG]: [
            STATES.READY,
            STATES.CONNECTED
        ],

        [TYPES.ACK]: [
            STATES.CONNECTED
        ]
    };

    const states =
        allowedStates[frame.type];

    if (!states) {
        console.warn(
            '[IRISH] No outbound state policy for frame'
        );

        return false;
    }

    if (
        !states.includes(
            connection.state
        )
    ) {
        console.warn(
            `[IRISH] Blocked outbound frame ` +
            `0x${frame.type.toString(16)} ` +
            `in state ${connection.state}`
        );

        return false;
    }

    return true;
}


function validateOutgoingFrame(
    connection,
    frame
) {
    if (
        !validateVersion(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validateFrameType(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validateFlags(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validatePayload(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validateMessageId(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validateSequence(
            connection,
            frame
        )
    ) {
        return false;
    }

    if (
        !validateState(
            connection,
            frame
        )
    ) {
        return false;
    }

    return true;
}


module.exports = {
    validateVersion,
    validateFrameType,
    validateFlags,
    validatePayload,
    validateMessageId,
    validateSequence,
    validateState,
    validateOutgoingFrame
};