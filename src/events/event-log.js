'use strict';

const addEvent = require('./components/addEvent.js');
const getByServer = require('/components/getByServer.js');

class EventLog {
    constructor() {
        this.events = new Map();
        this.sequences = new Map();
    }

add(event) {
    return addEvent(event, this.events, this.sequences);
}

    get(eventId) {
        const event = this.events.get(eventId);
        return event ? structuredClone(event) : null;
    }

    has(eventId) {
        return this.events.has(eventId);
    }

getByServer(serverId) {
    return getByServer(serverId, this.sequences, eventId => this.get(eventId));
}


    getByServerSequences(serverId, sequences) {
        if (
            !Array.isArray(sequences) ||
            sequences.some(sequence =>
                !Number.isSafeInteger(sequence) || sequence < 1
            )
        ) {
            throw new Error('Invalid sequence list');
        }

        const serverEvents = this.sequences.get(serverId);

        if (!serverEvents) {
            return [];
        }


        return sequences
            .map(sequence => serverEvents.get(sequence))
            .filter(Boolean)
            .map(eventId => this.get(eventId));
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
