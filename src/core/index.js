const Client = require('../client');
const Channel = require('../channel');
const events = require('../events');

class Core {
    constructor(serverName) {
        this.serverName = serverName;

        this.clients = new Set();
        this.channels = new Map();
    }

    getOrCreateChannel(name) {
        if (!this.channels.has(name)) {
            this.channels.set(name, new Channel(name));
        }

        return this.channels.get(name);
    }

    getChannel(name) {
    return this.channels.get(name) || null;
}

deleteChannel(name) {
    return this.channels.delete(name);
}

    registerClient(client) {
        if (!client.register()) {
            return false;
        }

        client.send(
            `:${this.serverName} 001 ${client.nick} :Welcome to Iris IRC`
        );

        client.send(
            `:${this.serverName} 002 ${client.nick} :Your host is ${this.serverName}`
        );

        client.send(
            `:${this.serverName} 003 ${client.nick} :This server was created today`
        );

        client.send(
            `:${this.serverName} 004 ${client.nick} ${this.serverName} iris-irc 0`
        );

        console.log(
            `[${client.id}] Registered as ${client.nick}`
        );

        events.emit('client:registered', {
    client
});

        return true;
    }

    cleanupClient(client) {
        for (const channel of [...client.channels]) {
            channel.removeClient(client);

            if (channel.isEmpty()) {
                this.channels.delete(channel.name);
            }
        }

        this.clients.delete(client);
    }

getClientByNick(nick) {
    return [...this.clients].find(
        client =>
            client.nick &&
            client.nick.toLowerCase() === nick.toLowerCase()
    ) || null;
}

    addClient(client) {
        this.clients.add(client);
    }

    removeClient(client) {
        this.clients.delete(client);
    }

    
}

module.exports = Core;
