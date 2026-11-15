class EventLog {
    constructor() {
        this.events = new Map();
        this.sequences = new Map();
    }

    createKey(originServerId, eventId) {
        return JSON.stringify([originServerId, eventId]);
    }

    add(event) {
        if (
            !event ||
            typeof event.originServerId !== 'string' ||
            !event.originServerId ||
            typeof event.eventId !== 'string' ||
            !event.eventId ||
            !Number.isSafeInteger(event.sequence) ||
            event.sequence < 1
        ) {
            throw new Error('Invalid recovery event');
        }

        const { originServerId, eventId, sequence } = event;
        const key = this.createKey(originServerId, eventId);

        if (this.events.has(key)) {
            return false;
        }

        if (!this.sequences.has(originServerId)) {
            this.sequences.set(originServerId, new Map());
        }

        const serverSequences = this.sequences.get(originServerId);

        if (serverSequences.has(sequence)) {
            throw new Error('Sequence number conflict');
        }

        this.events.set(key, event);
        serverSequences.set(sequence, key);

        return true;
    }

    get(originServerId, eventId) {
        const key = this.createKey(originServerId, eventId);
        return this.events.get(key) || null;
    }

    has(originServerId, eventId) {
        return this.events.has(
            this.createKey(originServerId, eventId)
        );
    }

    getMissingSequences(originServerId, throughSequence) {
        if (
            !Number.isSafeInteger(throughSequence) ||
            throughSequence < 0 ||
            throughSequence > 100000
        ) {
            throw new Error('Invalid sequence range');
        }

        const serverSequences = this.sequences.get(originServerId);
        const missing = [];

        for (let sequence = 1; sequence <= throughSequence; sequence++) {
            if (!serverSequences || !serverSequences.has(sequence)) {
                missing.push(sequence);
            }
        }

        return missing;
    }

    getBySequences(originServerId, sequences) {
        if (
            typeof originServerId !== 'string' ||
            !originServerId ||
            !Array.isArray(sequences)
        ) {
            throw new Error('Invalid sequence query');
        }

        const serverSequences = this.sequences.get(originServerId);
        const events = [];

        for (const sequence of sequences) {
            if (!Number.isSafeInteger(sequence) || sequence < 1) {
                throw new Error('Invalid sequence number');
            }

            const key = serverSequences?.get(sequence);

            if (key) {
                events.push(this.events.get(key));
            }
        }

        return events;
    }

    getAll() {
        return Array.from(this.events.values());
    }

    get size() {
        return this.events.size;
    }
}

module.exports = EventLog;