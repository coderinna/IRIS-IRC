'use strict';

const EVENT_TYPES = Object.freeze({
    ID_REGISTER: 'ID_REGISTER',
    ID_AUTH: 'ID_AUTH',
    NICK_CHANGE: 'NICK_CHANGE',
    CHANNEL_JOIN: 'CHANNEL_JOIN',
    CHANNEL_PART: 'CHANNEL_PART',
    CHANNEL_POWER: 'CHANNEL_POWER',
    CHANNEL_LOCK: 'CHANNEL_LOCK'
});

const validateCausalContext = require('./validateCausalContext.js');

function createEvent({
    serverId,
    sequence,
    type,
    actorId,
    targetId = null,
    channel = null,
    data = {},
    causalContext = {}
}) {
    if (typeof serverId !== 'string' || !serverId) {
        throw new Error('Invalid serverId');
    }

    if (!Number.isSafeInteger(sequence) || sequence < 1) {
        throw new Error('Invalid sequence');
    }

    if (!Object.values(EVENT_TYPES).includes(type)) {
        throw new Error('Invalid event type');
    }

    if (typeof actorId !== 'string' || !actorId) {
        throw new Error('Invalid actorId');
    }

    validateCausalContext(causalContext, serverId, sequence);

    return Object.freeze({
        eventId: `${serverId}:${sequence}`,
        serverId,
        sequence,
        type,
        actorId,
        targetId,
        channel,
        data: structuredClone(data),
        causalContext: Object.freeze({ ...causalContext })
    });
}

module.exports = {
    EVENT_TYPES,
    createEvent
};
