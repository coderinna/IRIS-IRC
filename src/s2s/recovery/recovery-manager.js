class RecoveryManager {
    constructor(eventLog) {
        if (!eventLog) {
            throw new Error('EventLog is required');
        }

        this.eventLog = eventLog;
    }

    createRecoveryRequest(originServerId, remoteLastSequence) {
        if (
            typeof originServerId !== 'string' ||
            !originServerId ||
            !Number.isSafeInteger(remoteLastSequence) ||
            remoteLastSequence < 0 ||
            remoteLastSequence > 100000
        ) {
            throw new Error('Invalid recovery request parameters');
        }

        const missingSequences = this.eventLog.getMissingSequences(
            originServerId,
            remoteLastSequence
        );

        return {
            type: 'RECOVERY_REQUEST',
            originServerId,
            missingSequences
        };
    }

    createRecoveryResponse(request) {
        if (
            !request ||
            request.type !== 'RECOVERY_REQUEST' ||
            typeof request.originServerId !== 'string' ||
            !request.originServerId ||
            !Array.isArray(request.missingSequences)
        ) {
            throw new Error('Invalid recovery request');
        }

        const sequences = request.missingSequences;

        if (
            sequences.length > 100000 ||
            sequences.some(sequence =>
                !Number.isSafeInteger(sequence) ||
                sequence < 1 ||
                sequence > 100000
            )
        ) {
            throw new Error('Invalid recovery sequence');
        }

        const uniqueSequences = [...new Set(sequences)];

        const events = this.eventLog.getBySequences(
            request.originServerId,
            uniqueSequences
        );

        const available = new Set(
            events.map(event => event.sequence)
        );

        return {
            type: 'RECOVERY_RESPONSE',
            originServerId: request.originServerId,
            events,
            unavailableSequences: uniqueSequences.filter(
                sequence => !available.has(sequence)
            )
        };
    }

    acceptRecoveryEvents(events) {
        if (!Array.isArray(events)) {
            throw new Error('Recovery events must be an array');
        }

        let accepted = 0;
        let duplicates = 0;

        for (const event of events) {
            const added = this.eventLog.add(event);

            if (added) {
                accepted++;
            } else {
                duplicates++;
            }
        }

        return {
            accepted,
            duplicates
        };
    }
}

module.exports = RecoveryManager;