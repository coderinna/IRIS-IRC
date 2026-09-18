class RemoteClientRegistry {
    constructor() {
        this.clients = new Map();
    }

key(serverId, clientId) {
    return `${serverId}:${clientId}`;
}

    register(client) {
        if (!client?.serverId || !client?.clientId) {
            throw new Error('Remote client requires serverId and clientId');
        }

        const key = this.key(
            client.serverId,
            client.clientId
        );

        this.clients.set(key, {
            ...client
        });

        return this.clients.get(key);
    }

    get(serverId, clientId) {
        return this.clients.get(
            this.key(serverId, clientId)
        );
    }

    getByNick(nick) {
    for (const client of this.clients.values()) {
        if (client.nick === nick) {
            return client;
        }
    }

    return null;
}

    has(serverId, clientId) {
        return this.clients.has(
            this.key(serverId, clientId)
        );
    }

    remove(serverId, clientId) {
        return this.clients.delete(
            this.key(serverId, clientId)
        );
    }

    clearServer(serverId) {
        for (const [key, client] of this.clients) {
            if (client.serverId === serverId) {
                this.clients.delete(key);
            }
        }
    }

    values() {
        return this.clients.values();
    }

    size() {
        return this.clients.size;
    }
}

module.exports = RemoteClientRegistry;