
'use strict';

function registerTransportHandlers({
    transport,
    handleSummary,
    handleSyncRequest,
    acceptEvent,
    peerSockets,
    process
}) {
    transport.on('message', (message, socket) => {
        try {
            switch (message.type) {
                case 'SYNC_SUMMARY':
                    handleSummary(message, socket);
                    break;

                case 'SYNC_REQUEST':
                    handleSyncRequest(message, socket);
                    break;

                case 'SYNC_EVENTS':
                    if (!Array.isArray(message.events)) {
                        throw new Error('Invalid SYNC_EVENTS');
                    }

                    for (const event of message.events) {
                        acceptEvent(event, socket);
                    }
                    break;

                case 'EVENT':
                    if (!message.event) {
                        throw new Error('Missing event');
                    }

                    acceptEvent(message.event, socket);
                    break;

                default:
                    throw new Error(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            process.send({
                type: 'workerError',
                error: error.message
            });
        }
    });

    transport.on('disconnect', socket => {
        for (const [peerId, peerSocket] of peerSockets) {
            if (peerSocket === socket) {
                peerSockets.delete(peerId);
            }
        }
    });

    transport.on('socketError', error => {
        process.send({
            type: 'workerError',
            error: error.message
        });
    });
}

module.exports = registerTransportHandlers;
