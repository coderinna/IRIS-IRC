
'use strict';

const TcpTransport = require('../../src/transport/tcp-transport');
const EventLog = require('../../src/events/evetLogs/event-log');
const StateMachine = require('../../src/state/state-machine');
const {
    createEvent,
    EVENT_TYPES
} = require('../../src/events/eventTypes/event-types');

const createCommandHandler = require('./handlers/command-handler.js');
const createSyncRequestHandler = require('./handlers/handle-sync-request.js');
const createSummaryHandler = require('./handlers/handle-summary.js');
const createSummary = require('./handlers/create-summary.js');
const createAcceptEvent = require('./handlers/accept-event.js');
const registerTransportHandlers = require('./handlers/transports/transport-handlers.js');

const serverId = process.argv[2];

if (!serverId) {
    throw new Error('Server ID is required');
}

const transport = new TcpTransport();
const eventLog = new EventLog();
const machine = new StateMachine();

const peerSockets = new Map();
const syncedSockets = new WeakSet();

function send(socket, message) {
    transport.send(socket, message);
}

function sendToPeers(message, exceptSocket = null) {
    for (const socket of peerSockets.values()) {
        if (socket !== exceptSocket && !socket.destroyed) {
            send(socket, message);
        }
    }
}


const acceptEvent = createAcceptEvent({
    eventLog,
    machine,
    sendToPeers
});

function sendSummary(socket) {
    send(socket, createSummary({
        eventLog,
        serverId
    }));
}

const handleSummary = createSummaryHandler({
    peerSockets,
    eventLog,
    send,
    syncedSockets,
    sendSummary
});

const handleSyncRequest = createSyncRequestHandler({
    eventLog,
    send
});

registerTransportHandlers({
    transport,
    handleSummary,
    handleSyncRequest,
    acceptEvent,
    peerSockets,
    process
});


const handleCommand = createCommandHandler({
    transport,
    peerSockets,
    sendSummary,
    serverId,
    eventLog,
    createEvent,
    EVENT_TYPES,
    acceptEvent,
    machine
});

process.on('message', async command => {
    try {
        const result = await handleCommand(command);

        process.send({
            type: 'result',
            id: command.id,
            result
        });
    } catch (error) {
        process.send({
            type: 'result',
            id: command.id,
            error: error.message
        });
    }
});

process.send({
    type: 'started',
    serverId
});
