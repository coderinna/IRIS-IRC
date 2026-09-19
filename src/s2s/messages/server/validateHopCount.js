// src/s2s/messages/server/validateHopCount.js

const LIMITS = {
    HOP_COUNT: 65535
};

function validateHopCount(hopCount) {
    if (
        !Number.isInteger(hopCount) ||
        hopCount < 0 ||
        hopCount > LIMITS.HOP_COUNT
    ) {
        throw new Error(
            'IRIS SERVER hopCount is invalid'
        );
    }
}

module.exports = validateHopCount;