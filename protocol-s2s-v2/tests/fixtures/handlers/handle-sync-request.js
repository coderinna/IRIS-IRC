
'use strict';

function createSyncRequestHandler({ eventLog, send }) {
    return function handleSyncRequest(message, socket) {
        if (!Array.isArray(message.requests)) {
            throw new Error('Invalid SYNC_REQUEST');
        }

        const events = [];

        for (const request of message.requests) {
            if (
                typeof request.serverId !== 'string' ||
                !Array.isArray(request.sequences)
            ) {
                throw new Error('Invalid sync request entry');
            }

            events.push(
                ...eventLog.getByServerSequences(
                    request.serverId,
                    request.sequences
                )
            );
        }

        if (events.length > 0) {
            send(socket, {
                type: 'SYNC_EVENTS',
                events
            });
        }
    };
}

module.exports = createSyncRequestHandler;
