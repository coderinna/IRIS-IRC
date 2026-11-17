'use strict';

const { EVENT_TYPES } = require('../../events/event-types');

 function validateEvent(event) {
        if (
            !event ||
            typeof event.eventId !== 'string' ||
            !event.eventId ||
            typeof event.serverId !== 'string' ||
            !event.serverId ||
            !Number.isSafeInteger(event.sequence) ||
            event.sequence < 1 ||
            typeof event.actorId !== 'string' ||
            !event.actorId ||
            !Object.values(EVENT_TYPES).includes(event.type) ||
            !event.data ||
            typeof event.data !== 'object' ||
            Array.isArray(event.data)
        ) {
            throw new Error('Invalid state event');
        }

        const context = event.causalContext ?? {};

        if (
            !context ||
            typeof context !== 'object' ||
            Array.isArray(context)
        ) {
            throw new Error('Invalid causal context');
        }

        for (const [serverId, sequence] of Object.entries(context)) {
            if (
                !serverId ||
                !Number.isSafeInteger(sequence) ||
                sequence < 0 ||
                (
                    serverId === event.serverId &&
                    sequence >= event.sequence
                )
            ) {
                throw new Error('Invalid causal context entry');
            }
        }

        const channelTypes = [
            EVENT_TYPES.CHANNEL_JOIN,
            EVENT_TYPES.CHANNEL_PART,
            EVENT_TYPES.CHANNEL_POWER,
            EVENT_TYPES.CHANNEL_LOCK
        ];

        if (
            channelTypes.includes(event.type) &&
            (typeof event.channel !== 'string' || !event.channel)
        ) {
            throw new Error('Channel is required');
        }

        if (
            event.type === EVENT_TYPES.CHANNEL_POWER &&
            (
                typeof event.targetId !== 'string' ||
                !event.targetId ||
                !Number.isInteger(event.data.level) ||
                event.data.level < 0 ||
                event.data.level > 100
            )
        ) {
            throw new Error('Invalid channel power event');
        }

        if (
            event.type === EVENT_TYPES.NICK_CHANGE &&
            (
                typeof event.data.newNick !== 'string' ||
                !event.data.newNick
            )
        ) {
            throw new Error('Invalid nick change event');
        }

        if (
            event.type === EVENT_TYPES.ID_REGISTER &&
            (
                typeof event.data.primaryNick !== 'string' ||
                !event.data.primaryNick
            )
        ) {
            throw new Error('Invalid identity registration event');
        }

        if (
            event.type === EVENT_TYPES.ID_AUTH &&
            (
                typeof event.data.sessionId !== 'string' ||
                !event.data.sessionId
            )
        ) {
            throw new Error('Invalid identity authentication event');
        }

        if (
            event.type === EVENT_TYPES.CHANNEL_LOCK &&
            (
                !event.data.lock ||
                typeof event.data.lock !== 'object' ||
                Array.isArray(event.data.lock)
            )
        ) {
            throw new Error('Invalid channel lock event');
        }
    }

module.exports = validateEvent;