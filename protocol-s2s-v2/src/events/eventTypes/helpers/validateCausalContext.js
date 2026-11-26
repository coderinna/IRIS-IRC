'use strict';

function validateCausalContext(context, serverId, sequence) {
    if (
        !context ||
        typeof context !== 'object' ||
        Array.isArray(context)
    ) {
        throw new Error('Invalid causal context');
    }

    for (const [origin, value] of Object.entries(context)) {
        if (
            !origin ||
            !Number.isSafeInteger(value) ||
            value < 0
        ) {
            throw new Error('Invalid causal context entry');
        }

        if (origin === serverId && value >= sequence) {
            throw new Error('Invalid own-server causal sequence');
        }
    }
}

module.exports = validateCausalContext;