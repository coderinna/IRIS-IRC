
'use strict';

const ProtocolNode = require('./ProtocolNode/ProtocolNode.js');

const reconnect = require('./operations/reconnect.js');
const emit = require('./operations/emit.js');

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
      
    get connected() {
        const serverCount = this.nodes.size;
        const expectedLinks = serverCount * (serverCount - 1) / 2;

        return this.links.size === expectedLinks;
    }

    getNode(serverId) {
        const node = this.nodes.get(serverId);

        if (!node) {
            throw new Error(`Unknown server: ${serverId}`);
        }

        return node;
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
    return emit(
        serverId,
        type,
        actorId,
        options,
        this.nodes,
        id => this.getNode(id),
        (source, target) => this.isConnected(source, target)
    );
}

reconnect() {
    return reconnect(
        this.nodes,
        () => this.connectAll(),
        () => this.hasConverged()
    );
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
