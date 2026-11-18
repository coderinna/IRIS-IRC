'use strict';

const { EVENT_TYPES } = require('../events/eventTypes/event-types');
const validateEvent = require('./operations/validateEvent.js');
const getOrderedEvents = require('./operations/getOrderedEvents.js');
const applyEvent = require('./operations/apply-event');
const mergeEvents = require('./operations/merge-events');
const rebuildState = require('./operations/rebuild-state');
const getSnapshot = require('./operations/get-snapshot');
const getChannel = require('./operations/get-channel');

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
    return mergeEvents.call(this, events);
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
    return rebuildState.call(this);
}

    getAccount(accountId) {
        const account = this.state.accounts.get(accountId);
        return account ? structuredClone(account) : null;
    }

    getSessionAccount(sessionId) {
        return this.state.sessions.get(sessionId) || null;
    }

 getChannel(channelName) {
    return getChannel.call(this, channelName);
}

getSnapshot() {
    return getSnapshot.call(this);
}

    get size() {
        return this.events.size;
    }
}

module.exports = StateMachine;
