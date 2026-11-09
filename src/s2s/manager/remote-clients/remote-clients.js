
class RemoteClientRegistry {
    constructor() {
        this.clients = new Map();
    }

    getKey(serverId, clientId) {
        return `${serverId}:${clientId}`;
    }

    register(client) {
        return this.add(client);
    }

    add(client) {
        if (!client?.clientId || !client?.serverId) {
            throw new Error(
                'Remote client requires clientId and serverId'
            );
        }

        const key = this.getKey(
            client.serverId,
            client.clientId
        );

        const existing = this.clients.get(key);

        if (existing) {
            if (
                existing.connection !== client.connection
            ) {
                throw new Error(
                    `Remote client identity collision: ${key}`
                );
            }

            throw new Error(
                `Remote client already registered: ${key}`
            );
        }

        this.clients.set(key, { ...client });

        return this.clients.get(key);
    }

    remove(serverId, clientId) {
        return this.clients.delete(
            this.getKey(serverId, clientId)
        );
    }

    removeByConnection(connection) {
        let removed = 0;

        for (const [key, client] of this.clients) {
            if (client.connection !== connection) {
                continue;
            }

            this.clients.delete(key);
            removed++;
        }

        return removed;
    }

    get(serverId, clientId) {
        return this.clients.get(
            this.getKey(serverId, clientId)
        ) || null;
    }

    getByNick(nick) {
        if (!nick) {
            return null;
        }

        for (const client of this.clients.values()) {
            if (
                client.nick &&
                client.nick.toLowerCase() === nick.toLowerCase()
            ) {
                return client;
            }
        }

        return null;
    }

    update(serverId, clientId, updates) {
        const client = this.get(serverId, clientId);

        if (!client) {
            return null;
        }

        Object.assign(client, updates);

        return client;
    }

    has(serverId, clientId) {
        return this.clients.has(
            this.getKey(serverId, clientId)
        );
    }

    values() {
        return this.clients.values();
    }

    size() {
        return this.clients.size;
    }

    getServerId(serverId, clientId) {
        const client = this.get(serverId, clientId);

        return client?.serverId || null;
    }
}

module.exports = RemoteClientRegistry;
