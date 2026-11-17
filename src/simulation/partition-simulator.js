
'use strict';

const StateMachine = require('../state/state-machine');
const updateVector = require('./operations/updateVector.js');
const createEventOperation = require('./operations/createEvent.js');

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
    const sequence = { value: this.sequence };

    updateVector(
        events,
        this.receivedSequences,
        this.serverId,
        sequence,
        this.vector
    );

    this.sequence = sequence.value;
}

  // Luo uuden tapahtuman ja liittää siihen palvelimen nykyisen tapahtumahistorian.
createEvent(type, actorId, options = {}) {
    const sequence = { value: this.sequence };

    const event = createEventOperation(
        type,
        actorId,
        options,
        this.serverId,
        sequence,
        this.vector
    );

    this.sequence = sequence.value;

    return event;
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
