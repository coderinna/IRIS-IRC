const crypto = require('crypto');

class Client {
    constructor(socket, core, events, serverId) {
        this.socket = socket;

        this.serverId = serverId;
        this.id = crypto.randomUUID();

        this.nick = null;
        this.user = null;

        this.registered = false;

        this.buffer = '';

        this.channels = new Set();
    }

    get host() {
        return 'localhost';
    }

    get mask() {
        return `${this.nick || '*'}!${this.user || '*'}@${this.host}`;
    }

    isOwnedBy(serverId) {
    return this.serverId === serverId;
}

    send(message) {
        this.socket.write(message + '\r\n');
    }

    addChannel(channel) {
        this.channels.add(channel);
    }

    removeChannel(channel) {
        this.channels.delete(channel);
    }

    isInChannel(channel) {
        return this.channels.has(channel);
    }

    register() {
        if (this.registered) {
            return false;
        }

        if (!this.nick || !this.user) {
            return false;
        }

        this.registered = true;

        return true;
    }

    destroy() {
        this.channels.clear();
        this.socket.destroy();
    }
}

module.exports = Client;