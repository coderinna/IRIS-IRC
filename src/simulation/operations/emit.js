'use strict';

function emit(serverId, type, actorId, options, nodes, getNode, isConnected) {
    const source = getNode(serverId);
    const event = source.createEvent(type, actorId, options);

    source.receive(event);

    for (const [targetId, target] of nodes) {
        if (
            targetId !== serverId &&
            isConnected(serverId, targetId)
        ) {
            target.receive(event);
        }
    }

    return event;
}

module.exports = emit;