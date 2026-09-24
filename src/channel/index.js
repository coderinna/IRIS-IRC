// src/channel/index.js

class Channel {
    constructor(name, ownerServerId = null) {
        this.name = name;
        this.topic = null;

        this.clients = new Set();
        this.servers = new Set();

        this.ownerServerId = ownerServerId;
        this.state = 'active';
    }

addClient(client) {
    if (this.clients.has(client)) {
        return false;
    }

    this.clients.add(client);
    client.channels.add(this);

    if (client.serverId) {
        this.servers.add(client.serverId);
    }

    return true;
}

/*    addClient(client) {
        if (this.clients.has(client)) {
            return false;
        }

        this.clients.add(client);
        client.channels.add(this);

        return true;
    }*/

removeClient(client) {
    if (!this.clients.has(client)) {
        return false;
    }

    this.clients.delete(client);
    client.channels.delete(this);

    if (client.serverId) {
        const hasServerMembers =
            [...this.clients].some(
                member =>
                    member.serverId === client.serverId
            );

        if (!hasServerMembers) {
            this.servers.delete(client.serverId);
        }
    }

    return true;
}

    hasClient(client) {
        return this.clients.has(client);
    }

    getMembers() {
        return [...this.clients];
    }

    getNicknames() {
        return [...this.clients]
            .map(client => client.nick)
            .filter(Boolean);
    }

    isEmpty() {
        return this.clients.size === 0;
    }

    addServer(serverId) {
        if (!serverId || this.servers.has(serverId)) {
            return false;
        }

        this.servers.add(serverId);

        return true;
    }

    removeServer(serverId) {
        return this.servers.delete(serverId);
    }

    hasServer(serverId) {
        return this.servers.has(serverId);
    }

    getServers() {
        return [...this.servers];
    }

    getOwnerServerId() {
        return this.ownerServerId;
    }

    setOwnerServer(serverId) {
        this.ownerServerId = serverId || null;
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }

    isActive() {
        return this.state === 'active';
    }

    isRemoved() {
        return this.state === 'removed';
    }

hasServerMembers(serverId) {
    return [...this.clients].some(
        client => client.serverId === serverId
    );
}

    broadcast(message, except = null) {
        for (const client of this.clients) {
            if (client !== except) {
                client.send(message);
            }
        }
    }

    getTopic() {
        return this.topic;
    }

    setTopic(value) {
        this.topic = value || null;
    }

    hasTopic() {
        return Boolean(this.topic);
    }
}

module.exports = Channel;