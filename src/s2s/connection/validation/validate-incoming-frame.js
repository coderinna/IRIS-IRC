
// src/s2s/connection/validation/validate-incoming-frame.js

const validateSequence =
    require('./validate-sequence.js');

const validateMessageId =
    require('./validate-message-id.js');

const validateRateLimit =
    require('./validate-rate-limit.js');

module.exports =
    function validateIncomingFrame(
        connection,
        frame
    ) {
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
            !validateRateLimit(
                connection
            )
        ) {
            return false;
        }

        return true;
    };