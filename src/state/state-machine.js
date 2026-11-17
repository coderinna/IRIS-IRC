'use strict';

const { EVENT_TYPES } = require('../events/event-types');
const validateEvent = require('./helpers/validateEvent.js');

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
        const events = [...this.events.values()];
        const outgoing = new Map();
        const incoming = new Map();

        for (const event of events) {
            outgoing.set(event.eventId, []);
            incoming.set(event.eventId, 0);
        }

        for (const a of events) {
            for (const b of events) {
                if (
                    a.eventId === b.eventId ||
                    !this.happensBefore(a, b)
                ) {
                    continue;
                }

                outgoing.get(a.eventId).push(b.eventId);
                incoming.set(
                    b.eventId,
                    incoming.get(b.eventId) + 1
                );
            }
        }

        const byId = new Map(
            events.map(event => [event.eventId, event])
        );

        const ready = events
            .filter(event => incoming.get(event.eventId) === 0)
            .sort((a, b) => this.compareEvents(a, b));

        const ordered = [];

        while (ready.length > 0) {
            const event = ready.shift();
            ordered.push(event);

            for (const nextId of outgoing.get(event.eventId)) {
                const count = incoming.get(nextId) - 1;
                incoming.set(nextId, count);

                if (count === 0) {
                    ready.push(byId.get(nextId));
                    ready.sort((a, b) => this.compareEvents(a, b));
                }
            }
        }

        if (ordered.length !== events.length) {
            throw new Error('Causal dependency cycle detected');
        }

        return ordered.map(event => structuredClone(event));
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
                /*
                 * CHANNEL_PART is handled by rebuild(), because PART
                 * must remove only JOIN events that it causally observed.
                 */
                break;

            default:
                throw new Error(`Unsupported event type: ${event.type}`);
        }
    }

    rebuild() {
        this.state = this.createEmptyState();

        /*
         * Each JOIN event creates its own membership tag.
         *
         * key:
         *   channel + actor
         *
         * value:
         *   Set of JOIN event IDs currently representing
         *   that actor's membership.
         */
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
