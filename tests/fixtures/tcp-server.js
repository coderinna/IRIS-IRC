
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

function acceptEvent(event, sourceSocket = null) {
    const accepted = eventLog.add(event);

    if (!accepted) {
        return false;
    }

    machine.add(event);

    sendToPeers({
        type: 'EVENT',
        event
    }, sourceSocket);

    return true;
}

function createSummary() {
    const servers = [];

    for (const event of eventLog.getAll()) {
        let entry = servers.find(item =>
            item.serverId === event.serverId
        );

        if (!entry) {
            entry = {
                serverId: event.serverId,
                throughSequence: 0,
                missingSequences: []
            };

            servers.push(entry);
        }

        entry.throughSequence = Math.max(
            entry.throughSequence,
            event.sequence
        );
    }

    for (const entry of servers) {
        entry.missingSequences = eventLog.getMissingSequences(
            entry.serverId,
            entry.throughSequence
        );
    }

    return {
        type: 'SYNC_SUMMARY',
        serverId,
        servers
    };
}

function sendSummary(socket) {
    send(socket, createSummary());
}

function handleSummary(message, socket) {
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
}

const handleSyncRequest = createSyncRequestHandler({
    eventLog,
    send
});

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
