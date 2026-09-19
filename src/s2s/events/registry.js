// src/s2s/event/registry.js

class EventRegistry {
    constructor(maxEvents = 100000) {
        this.events = new Set();
        this.maxEvents = maxEvents;
    }

    has(eventId) {
        return this.events.has(eventId);
    }

    remember(eventId) {
        if (!eventId) {
            return false;
        }

        if (this.events.has(eventId)) {
            return false;
        }

        this.events.add(eventId);

        this.cleanup();

        return true;
    }

    cleanup() {
        while (
            this.events.size >
            this.maxEvents
        ) {
            const oldest =
                this.events.values().next().value;

            this.events.delete(oldest);
        }
    }

    clear() {
        this.events.clear();
    }

    size() {
        return this.events.size;
    }
}

module.exports = EventRegistry;