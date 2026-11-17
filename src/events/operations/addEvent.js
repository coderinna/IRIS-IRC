'use strict';

function addEvent(event, events, sequences) {
    if (
        !event ||
        typeof event.eventId !== 'string' ||
        typeof event.serverId !== 'string' ||
        !event.serverId ||
        !Number.isSafeInteger(event.sequence) ||
        event.sequence < 1
    ) {
        throw new Error('Invalid protocol event');
    }

    const existing = events.get(event.eventId);

    if (existing) {
        return false;
    }

    let serverEvents = sequences.get(event.serverId);

    if (!serverEvents) {
        serverEvents = new Map();
        sequences.set(event.serverId, serverEvents);
    }

    if (serverEvents.has(event.sequence)) {
        throw new Error('Sequence conflict');
    }

    const storedEvent = structuredClone(event);

    events.set(event.eventId, storedEvent);
    serverEvents.set(event.sequence, event.eventId);

    return true;
}

module.exports = addEvent;