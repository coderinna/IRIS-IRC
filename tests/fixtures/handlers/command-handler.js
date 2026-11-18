
'use strict';

function createCommandHandler({
    transport,
    peerSockets,
    sendSummary,
    serverId,
    eventLog,
    createEvent,
    EVENT_TYPES,
    acceptEvent,
    machine
}) {
    return async function handleCommand(command) {
        switch (command.cmd) {
            case 'listen': {
                const address = await transport.listen();
                return { port: address.port };
            }

            case 'connect': {
                const socket = await transport.connect(command.port);

                peerSockets.set(command.peerId, socket);
                sendSummary(socket);

                return { connected: command.peerId };
            }

            case 'disconnect': {
                const socket = peerSockets.get(command.peerId);

                if (socket) {
                    peerSockets.delete(command.peerId);
                    socket.destroy();
                }

                return { disconnected: command.peerId };
            }

            case 'create': {
                const events = eventLog.getAll();
                const causalContext = {};

                for (const event of events) {
                    causalContext[event.serverId] = Math.max(
                        causalContext[event.serverId] || 0,
                        event.sequence
                    );
                }

                const sequence = Math.max(
                    0,
                    causalContext[serverId] || 0
                ) + 1;

                delete causalContext[serverId];

                const event = createEvent({
                    serverId,
                    sequence,
                    type: EVENT_TYPES.ID_REGISTER,
                    actorId: command.actorId,
                    data: {
                        primaryNick: command.primaryNick
                    },
                    causalContext
                });

                acceptEvent(event);

                return { event };
            }

            case 'inject': {
                if (!command.event) {
                    throw new Error('Missing injected event');
                }

                const accepted = acceptEvent(command.event);

                return { accepted };
            }

            case 'inspect': {
                return {
                    serverId,
                    events: eventLog.getAll(),
                    snapshot: machine.getSnapshot()
                };
            }

            case 'shutdown': {
                await transport.close();
                return { stopped: true };
            }

            default:
                throw new Error(`Unknown command: ${command.cmd}`);
        }
    };
}

module.exports = createCommandHandler;
