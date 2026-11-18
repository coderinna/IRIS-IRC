'use strict';

const { EVENT_TYPES } = require('../events/eventTypes/event-types');
const validateEvent = require('./operations/validateEvent.js');
const getOrderedEvents = require('./operations/getOrderedEvents.js');
const applyEvent = require('./operations/apply-event');

class StateMachine {
    constructor() {
        this.events = new Map();
        this.state = this.createEmptyState();
    }

    createEmptyState() {
        return {
            accounts: new Map(),
            sessions: new Map(),
            channels: new Map()
        };
    }

  validateEvent(event) {
    return validateEvent(event);
}

    add(event) {
        this.validateEvent(event);

        if (this.events.has(event.eventId)) {
            return false;
        }

        this.events.set(event.eventId, structuredClone(event));
        this.rebuild();

        return true;
    }

    merge(events) {
        if (!Array.isArray(events)) {
            throw new Error('Events must be an array');
        }

        for (const event of events) {
            this.validateEvent(event);
        }

        let accepted = 0;
        let duplicates = 0;

        for (const event of events) {
            if (this.add(event)) {
                accepted++;
            } else {
                duplicates++;
            }
        }

        return { accepted, duplicates };
    }

    compareEvents(a, b) {
        if (a.sequence !== b.sequence) {
            return a.sequence - b.sequence;
        }

        const serverOrder = a.serverId.localeCompare(b.serverId);

        if (serverOrder !== 0) {
            return serverOrder;
        }

        return a.eventId.localeCompare(b.eventId);
    }

    happensBefore(a, b) {
        if (
            a.serverId === b.serverId &&
            a.sequence < b.sequence
        ) {
            return true;
        }

        const seenSequence =
            b.causalContext?.[a.serverId] ?? 0;

        return seenSequence >= a.sequence;
    }

getOrderedEvents() {
    return getOrderedEvents(
        this.events,
        (a, b) => this.happensBefore(a, b),
        (a, b) => this.compareEvents(a, b)
    );
}

    getOrCreateAccount(accountId) {
        if (!this.state.accounts.has(accountId)) {
            this.state.accounts.set(accountId, {
                primaryNick: null
            });
        }

        return this.state.accounts.get(accountId);
    }

    getOrCreateChannel(channelName) {
        if (!this.state.channels.has(channelName)) {
            this.state.channels.set(channelName, {
                members: new Set(),
                powers: new Map(),
                lock: {}
            });
        }

        return this.state.channels.get(channelName);
    }

applyEvent(event) {
    return applyEvent.call(this, event);
}

    rebuild() {
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

                /*
                 * PART removes only JOINs that happened before it.
                 *
                 * A concurrent JOIN is deliberately retained.
                 */
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

    getAccount(accountId) {
        const account = this.state.accounts.get(accountId);
        return account ? structuredClone(account) : null;
    }

    getSessionAccount(sessionId) {
        return this.state.sessions.get(sessionId) || null;
    }

    getChannel(channelName) {
        const channel = this.state.channels.get(channelName);

        if (!channel) {
            return null;
        }

        return {
            members: [...channel.members].sort(),
            powers: Object.fromEntries(
                [...channel.powers.entries()].sort(([a], [b]) =>
                    a.localeCompare(b)
                )
            ),
            lock: structuredClone(channel.lock)
        };
    }

    getSnapshot() {
        const accounts = {};

        for (const [id, account] of [...this.state.accounts.entries()]
            .sort(([a], [b]) => a.localeCompare(b))) {
            accounts[id] = structuredClone(account);
        }

        const sessions = Object.fromEntries(
            [...this.state.sessions.entries()].sort(([a], [b]) =>
                a.localeCompare(b)
            )
        );

        const channels = {};

        for (const name of [...this.state.channels.keys()].sort()) {
            channels[name] = this.getChannel(name);
        }

        return { accounts, sessions, channels };
    }

    get size() {
        return this.events.size;
    }
}

module.exports = StateMachine;
