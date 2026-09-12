const members = require('./members');

class Channel {
    constructor(name) {
        this.name = name;
        this.topic = null;
        this.clients = new Set();
    }

    addClient(client) {
        return members.addClient(this, client);
    }

    removeClient(client) {
        return members.removeClient(this, client);
    }

    hasClient(client) {
        return members.hasClient(this, client);
    }

    broadcast(message, except = null) {
        for (const client of this.clients) {
            if (client !== except) {
                client.send(message);
            }
        }
    }

    getMembers() {
        return members.getMembers(this);
    }

    getNicknames() {
        return members.getNicknames(this);
    }

    isEmpty() {
        return members.isEmpty(this);
    }
}

module.exports = Channel;