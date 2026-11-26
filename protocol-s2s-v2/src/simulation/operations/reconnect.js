'use strict';

function reconnect(nodes, connectAll, hasConverged) {
    const allEvents = new Map();

    for (const node of nodes.values()) {
        for (const event of node.getEvents()) {
            allEvents.set(event.eventId, event);
        }
    }

    const events = [...allEvents.values()];
    const results = {};

    for (const [serverId, node] of nodes) {
        results[serverId] = node.machine.merge(events);
        node.updateVector(events);
    }

    connectAll();

    return {
        servers: results,
        converged: hasConverged()
    };
}

module.exports = reconnect;