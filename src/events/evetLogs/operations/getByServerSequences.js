'use strict';

function getByServerSequences(serverId, sequences, sequenceMap, get) {
    if (
        !Array.isArray(sequences) ||
        sequences.some(sequence =>
            !Number.isSafeInteger(sequence) || sequence < 1
        )
    ) {
        throw new Error('Invalid sequence list');
    }

    const serverEvents = sequenceMap.get(serverId);

    if (!serverEvents) {
        return [];
    }

    return sequences
        .map(sequence => serverEvents.get(sequence))
        .filter(Boolean)
        .map(eventId => get(eventId));
}

module.exports = getByServerSequences;