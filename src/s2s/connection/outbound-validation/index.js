const {
    TYPES,
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    decodeHeader
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
            '[IRIS] Unsupported outgoing protocol version'
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
            '[IRIS] Invalid outgoing frame flags'
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
            '[IRIS] Invalid outgoing message ID'
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
            '[IRIS] Invalid outgoing sequence'
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


function validateOutgoingFrame(
    connection,
    frame
) {
    if (!Buffer.isBuffer(frame)) {
        console.warn(
            '[IRIS] Outgoing frame must be a Buffer'
        );

        return false;
    }

    let header;

    try {
        header =
            decodeHeader(frame);
    } catch (error) {
        console.warn(
            '[IRIS] Invalid outgoing frame header:',
            error.message
        );

        return false;
    }

    const expectedLength =
        HEADER_SIZE +
        header.payloadLength;

    if (frame.length !== expectedLength) {
        console.warn(
            '[IRIS] Invalid outgoing frame length'
        );

        return false;
    }

    const normalizedFrame = {
        version: header.version,
        type: header.type,
        flags: header.flags,
        payload: frame.subarray(
            HEADER_SIZE,
            expectedLength
        ),
        messageId: header.messageId,
        sequence: header.sequence
    };

    if (
        !validateVersion(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validateFrameType(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validateFlags(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validatePayload(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validateMessageId(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validateSequence(
            connection,
            normalizedFrame
        )
    ) {
        return false;
    }

    if (
        !validateState(
            connection,
            normalizedFrame
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