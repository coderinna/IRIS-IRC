'use strict';

class EventLog {
    constructor() {
        this.events = new Map();
        this.sequences = new Map();
    }

    add(event) {
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

        const existing = this.events.get(event.eventId);

        if (existing) {
            return false;
        }

        let serverEvents = this.sequences.get(event.serverId);

        if (!serverEvents) {
            serverEvents = new Map();
            this.sequences.set(event.serverId, serverEvents);
        }

        if (serverEvents.has(event.sequence)) {
            throw new Error('Sequence conflict');
        }

        const storedEvent = structuredClone(event);

        this.events.set(event.eventId, storedEvent);
        serverEvents.set(event.sequence, event.eventId);

        return true;
    }

    get(eventId) {
        const event = this.events.get(eventId);
        return event ? structuredClone(event) : null;
    }

    has(eventId) {
        return this.events.has(eventId);
    }

    getByServer(serverId) {
        const serverEvents = this.sequences.get(serverId);

        if (!serverEvents) {
            return [];
        }

        return [...serverEvents.entries()]
            .sort(([a], [b]) => a - b)
            .map(([, eventId]) => this.get(eventId));
    }

    getMissingSequences(serverId, throughSequence) {
        if (
            !Number.isSafeInteger(throughSequence) ||
            throughSequence < 0
        ) {
            throw new Error('Invalid sequence range');
        }

        const serverEvents = this.sequences.get(serverId);
        const missing = [];

        for (let sequence = 1; sequence <= throughSequence; sequence++) {
            if (!serverEvents?.has(sequence)) {
                missing.push(sequence);
            }
        }

        return missing;
    }

    getAll() {
        return [...this.events.values()].map(event =>
            structuredClone(event)
        );
    }

    get size() {
        return this.events.size;
    }
}

module.exports = EventLog;
