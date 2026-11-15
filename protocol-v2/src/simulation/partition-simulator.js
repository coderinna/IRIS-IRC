
'use strict';

const StateMachine = require('../state/state-machine');
const { createEvent } = require('../events/event-types');

class ProtocolNode {
    constructor(serverId, initialEvents = []) {
        this.serverId = serverId;
        this.machine = new StateMachine();
        this.sequence = 0;
        this.vector = new Map();
this.receivedSequences = new Map();
        this.machine.merge(initialEvents);
        this.updateVector(initialEvents);
    }

  updateVector(events) {
    for (const event of events) {
        let received = this.receivedSequences.get(event.serverId);

        if (!received) {
            received = new Set();
            this.receivedSequences.set(event.serverId, received);
        }

        received.add(event.sequence);

        // Keep the local sequence generator above every known local event.
        if (
            event.serverId === this.serverId &&
            event.sequence > this.sequence
        ) {
            this.sequence = event.sequence;
        }

        // Advance only through a contiguous sequence history.
        let current = this.vector.get(event.serverId) || 0;

        while (received.has(current + 1)) {
            current++;
        }

        this.vector.set(event.serverId, current);
    }
}

    createEvent(type, actorId, options = {}) {
        this.sequence++;

        const causalContext = Object.fromEntries(this.vector);

        return createEvent({
            serverId: this.serverId,
            sequence: this.sequence,
            type,
            actorId,
            targetId: options.targetId ?? null,
            channel: options.channel ?? null,
            data: options.data ?? {},
            causalContext
        });
    }

    receive(event) {
        const accepted = this.machine.add(event);
        this.updateVector([event]);

        return accepted;
    }

    getEvents() {
        return this.machine.getOrderedEvents();
    }

    getSnapshot() {
        return this.machine.getSnapshot();
    }
}

class PartitionSimulator {
    constructor(initialEvents = [], serverIds = ['A', 'B']) {
        if (!Array.isArray(serverIds) || serverIds.length < 2) {
            throw new Error('At least two servers are required');
        }

        this.nodes = new Map(
            serverIds.map(serverId => [
                serverId,
                new ProtocolNode(serverId, initialEvents)
            ])
        );

        this.links = new Set();

        this.connectAll();
    }

    getNode(serverId) {
        const node = this.nodes.get(serverId);

        if (!node) {
            throw new Error(`Unknown server: ${serverId}`);
        }

        return node;
    }

        get connected() {
        const serverCount = this.nodes.size;
        const expectedLinks = serverCount * (serverCount - 1) / 2;

        return this.links.size === expectedLinks;
    }

    getLinkKey(serverA, serverB) {
        return [serverA, serverB].sort().join(':');
    }

    connect(serverA, serverB) {
        this.getNode(serverA);
        this.getNode(serverB);

        if (serverA === serverB) {
            throw new Error('Cannot connect a server to itself');
        }

        this.links.add(this.getLinkKey(serverA, serverB));
    }

    disconnect(serverA, serverB) {
        if (serverA && serverB) {
            this.links.delete(this.getLinkKey(serverA, serverB));
            return;
        }

        this.links.clear();
    }

    connectAll() {
        const serverIds = [...this.nodes.keys()];

        for (let i = 0; i < serverIds.length; i++) {
            for (let j = i + 1; j < serverIds.length; j++) {
                this.connect(serverIds[i], serverIds[j]);
            }
        }
    }

    isConnected(serverA, serverB) {
        return this.links.has(this.getLinkKey(serverA, serverB));
    }

    emit(serverId, type, actorId, options = {}) {
        const source = this.getNode(serverId);
        const event = source.createEvent(type, actorId, options);

        source.receive(event);

        for (const [targetId, target] of this.nodes) {
            if (
                targetId !== serverId &&
                this.isConnected(serverId, targetId)
            ) {
                target.receive(event);
            }
        }

        return event;
    }

    reconnect() {
        const allEvents = new Map();

        for (const node of this.nodes.values()) {
            for (const event of node.getEvents()) {
                allEvents.set(event.eventId, event);
            }
        }

        const events = [...allEvents.values()];
        const results = {};

        for (const [serverId, node] of this.nodes) {
            results[serverId] = node.machine.merge(events);
            node.updateVector(events);
        }

        this.connectAll();

        return {
            servers: results,
            converged: this.hasConverged()
        };
    }

    hasConverged() {
        const snapshots = [...this.nodes.values()]
            .map(node => JSON.stringify(node.getSnapshot()));

        const histories = [...this.nodes.values()]
            .map(node => JSON.stringify(node.getEvents()));

        return (
            snapshots.every(value => value === snapshots[0]) &&
            histories.every(value => value === histories[0])
        );
    }

    getSnapshot(serverId) {
        return this.getNode(serverId).getSnapshot();
    }

    getEvents(serverId) {
        return this.getNode(serverId).getEvents();
    }
}

module.exports = PartitionSimulator;
