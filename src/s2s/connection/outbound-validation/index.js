const {
    TYPES
} = require('../../protocol/frame');

function validateMessageId(
    connection,
    frame
) {
    if (
        !frame ||
        typeof frame.messageId !== 'number' ||
        !Number.isInteger(frame.messageId) ||
        frame.messageId < 0
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
        typeof frame.sequence !== 'number' ||
        !Number.isInteger(frame.sequence) ||
        frame.sequence < 0
    ) {
        console.warn(
            '[IRISH] Invalid outgoing sequence'
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
        typeof frame.type !== 'number'
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

function validateOutgoingFrame(
    connection,
    frame
) {
    if (
        !validateFrameType(
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

    return true;
}

module.exports = {
    validateMessageId,
    validateSequence,
    validateFrameType,
    validateOutgoingFrame
};