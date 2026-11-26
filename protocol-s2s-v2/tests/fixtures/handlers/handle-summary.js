
'use strict';

function createSummaryHandler({
    peerSockets,
    eventLog,
    send,
    syncedSockets,
    sendSummary
}) {
    return function handleSummary(message, socket) {
        if (
            typeof message.serverId !== 'string' ||
            !Array.isArray(message.servers)
        ) {
            throw new Error('Invalid SYNC_SUMMARY');
        }

        peerSockets.set(message.serverId, socket);

        const requests = [];

        for (const remote of message.servers) {
            if (
                typeof remote.serverId !== 'string' ||
                !Number.isSafeInteger(remote.throughSequence) ||
                remote.throughSequence < 0 ||
                !Array.isArray(remote.missingSequences)
            ) {
                throw new Error('Invalid server summary');
            }

            const remoteMissing = new Set(remote.missingSequences);
            const remoteKnown = [];

            for (
                let sequence = 1;
                sequence <= remote.throughSequence;
                sequence++
            ) {
                if (!remoteMissing.has(sequence)) {
                    remoteKnown.push(sequence);
                }
            }

            const localEvents = eventLog.getByServer(remote.serverId);
            const localSequences = new Set(
                localEvents.map(event => event.sequence)
            );

            const missingLocally = remoteKnown.filter(
                sequence => !localSequences.has(sequence)
            );

            if (missingLocally.length > 0) {
                requests.push({
                    serverId: remote.serverId,
                    sequences: missingLocally
                });
            }

            const remoteSequences = new Set(remoteKnown);

            const missingRemotely = localEvents
                .filter(event => !remoteSequences.has(event.sequence))
                .map(event => event.sequence);

            if (missingRemotely.length > 0) {
                const events = eventLog.getByServerSequences(
                    remote.serverId,
                    missingRemotely
                );

                send(socket, {
                    type: 'SYNC_EVENTS',
                    events
                });
            }
        }

        if (requests.length > 0) {
            send(socket, {
                type: 'SYNC_REQUEST',
                requests
            });
        }

        if (!syncedSockets.has(socket)) {
            syncedSockets.add(socket);
            sendSummary(socket);
        }
    };
}

module.exports = createSummaryHandler;
