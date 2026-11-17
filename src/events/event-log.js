'use strict';

const addEvent = require('./operations/addEvent.js');
const getByServer = require('./operations/getByServer.js');
const getByServerSequences = require('./operations/getByServerSequences.js');
const getMissingSequences = require('./operations/getMissingSequences.js');

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
    return getByServerSequences(
        serverId,
        sequences,
        this.sequences,
        eventId => this.get(eventId)
    );
}


getMissingSequences(serverId, throughSequence) {
    return getMissingSequences(
        serverId,
        throughSequence,
        this.sequences
    );
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
