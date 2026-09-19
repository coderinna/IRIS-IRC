// src/channel/index.js

class Channel {
    constructor(name) {
        this.name = name;
        this.topic = null;
        this.clients = new Set();
    }

    addClient(client) {
        if (this.clients.has(client)) {
            return false;
        }

        this.clients.add(client);
        client.channels.add(this);

        return true;
    }

    removeClient(client) {
        if (!this.clients.has(client)) {
            return false;
        }

        this.clients.delete(client);
        client.channels.delete(this);

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