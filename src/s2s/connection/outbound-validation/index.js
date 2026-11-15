const authorizeOutbound =
    require('../../security/authorization/authorize-outbound');
    const validateVersion =
    require('./validation/validateVersion.js');

    const validateFrameType =
    require('./validation/validateFrameType.js');

    const validateFlags =
    require('./validation/validateFlags.js');

    const validatePayload =
    require('./validation/validatePayload.js');

    const validateMessageId =
    require('./validation/validateMessageId.js');

    const validateSequence =
    require('./validation/validateSequence.js');

    const validateState =
    require('./validation/validateState.js');

const {
    HEADER_SIZE,
    decodeHeader
} = require('../../protocol/frame/frame.js');

function validateOutgoingFrame(
    connection,
    frame,
    action = null
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

    if (action !== null) {
    const authorization =
        authorizeOutbound({
            serverPolicy: connection.serverPolicy,
            action
        });

    if (!authorization.authorized) {
        console.warn(
            '[S2S] Outbound action denied:',
            authorization.reason,
            action
        );

        return false;
    }
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