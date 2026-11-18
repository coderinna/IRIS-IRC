
'use strict';

const { EVENT_TYPES } = require('../../events/eventTypes/event-types');

function rebuild() {
    this.state = this.createEmptyState();

    const membershipTags = new Map();

    const getMembershipKey = event =>
        `${event.channel}:${event.actorId}`;

    const syncMembershipState = event => {
        const key = getMembershipKey(event);
        const tags = membershipTags.get(key) || new Set();
        const channel = this.getOrCreateChannel(event.channel);

        if (tags.size > 0) {
            channel.members.add(event.actorId);
        } else {
            channel.members.delete(event.actorId);
        }
    };

    for (const event of this.getOrderedEvents()) {
        if (event.type === EVENT_TYPES.CHANNEL_JOIN) {
            const key = getMembershipKey(event);

            if (!membershipTags.has(key)) {
                membershipTags.set(key, new Set());
            }

            membershipTags.get(key).add(event.eventId);

            syncMembershipState(event);
            continue;
        }

        if (event.type === EVENT_TYPES.CHANNEL_PART) {
            const key = getMembershipKey(event);
            const tags = membershipTags.get(key);

            if (!tags) {
                continue;
            }

            for (const joinEventId of [...tags]) {
                const joinEvent = this.events.get(joinEventId);

                if (joinEvent && this.happensBefore(joinEvent, event)) {
                    tags.delete(joinEventId);
                }
            }

            syncMembershipState(event);
            continue;
        }

        this.applyEvent(event);
    }
}

module.exports = rebuild;
