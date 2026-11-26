'use strict';

function getMissingSequences(serverId, throughSequence, sequences) {
    if (
        !Number.isSafeInteger(throughSequence) ||
        throughSequence < 0
    ) {
        throw new Error('Invalid sequence range');
    }

    const serverEvents = sequences.get(serverId);
    const missing = [];

    for (let sequence = 1; sequence <= throughSequence; sequence++) {
        if (!serverEvents?.has(sequence)) {
            missing.push(sequence);
        }
    }

    return missing;
}

module.exports = getMissingSequences;