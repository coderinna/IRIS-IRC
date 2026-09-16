const validateSequence = (
    connection,
    frame
) => {
    if (
        frame.sequence !==
        connection.receiveSequence
    ) {
        console.error(
            `[IRISH] Invalid S2S sequence: ` +
            `expected ${connection.receiveSequence}, ` +
            `received ${frame.sequence}`
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};

const validateMessageId = (
    connection,
    frame
) => {
    if (
        !frame.messageId ||
        frame.messageId.length !== 16
    ) {
        console.error(
            '[IRISH] Invalid S2S messageId'
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};

const validateRateLimit = connection => {
    const now = Date.now();

    if (
        now - connection.rateLimit.startedAt >=
        connection.rateLimit.windowMs
    ) {
        connection.rateLimit.startedAt = now;
        connection.rateLimit.frames = 0;
    }

    connection.rateLimit.frames++;

    if (
        connection.rateLimit.frames >
        connection.rateLimit.maxFrames
    ) {
        console.error(
            '[IRISH] S2S frame rate limit exceeded'
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};

const validateIncomingFrame = (
    connection,
    frame
) => {
    if (
        !validateSequence(
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

    connection.receiveSequence++;

    if (
        !validateRateLimit(connection)
    ) {
        return false;
    }

    return true;
};

module.exports = {
    validateIncomingFrame
};