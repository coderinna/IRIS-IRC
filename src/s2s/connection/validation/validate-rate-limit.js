
// src/s2s/connection/validation/validate-rate-limit.js

module.exports = function validateRateLimit(
    connection
) {
    const now =
        Date.now();

    if (
        now -
        connection.rateLimit.startedAt >=
        connection.rateLimit.windowMs
    ) {
        connection.rateLimit.startedAt =
            now;

        connection.rateLimit.frames =
            0;
    }

    connection.rateLimit.frames++;

    if (
        connection.rateLimit.frames >
        connection.rateLimit.maxFrames
    ) {
        console.error(
            '[IRIS] S2S frame rate limit exceeded'
        );

        connection.socket.destroy();

        return false;
    }

    return true;
};