
'use strict';

const { EVENT_TYPES } = require('../../events/eventTypes/event-types');

function applyEvent(event) {
    switch (event.type) {
        case EVENT_TYPES.ID_REGISTER: {
            const account = this.getOrCreateAccount(event.actorId);
            account.primaryNick = event.data.primaryNick;
            break;
        }

        case EVENT_TYPES.ID_AUTH: {
            this.getOrCreateAccount(event.actorId);

            this.state.sessions.set(
                event.data.sessionId,
                event.actorId
            );

            break;
        }

        case EVENT_TYPES.NICK_CHANGE: {
            const account = this.getOrCreateAccount(event.actorId);
            account.primaryNick = event.data.newNick;
            break;
        }

        case EVENT_TYPES.CHANNEL_JOIN: {
            this.getOrCreateChannel(event.channel)
                .members.add(event.actorId);

            break;
        }

        case EVENT_TYPES.CHANNEL_POWER: {
            this.getOrCreateChannel(event.channel)
                .powers.set(event.targetId, event.data.level);

            break;
        }

        case EVENT_TYPES.CHANNEL_LOCK: {
            this.getOrCreateChannel(event.channel).lock =
                structuredClone(event.data.lock);

            break;
        }

        case EVENT_TYPES.CHANNEL_PART:
            break;

        default:
            throw new Error(`Unsupported event type: ${event.type}`);
    }
}

module.exports = applyEvent;
