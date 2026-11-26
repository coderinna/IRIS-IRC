'use strict';

function getByServer(serverId, sequences, get) {
    const serverEvents = sequences.get(serverId);

    if (!serverEvents) {
        return [];
    }

    return [...serverEvents.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, eventId]) => get(eventId));
}

module.exports = getByServer;