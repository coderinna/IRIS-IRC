// src/s2s/manager/remote-clients/remote-clients.js

class RemoteClientRegistry {
    constructor() {
        this.clients = new Map();
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

        this.clients.set(
            client.clientId,
            { ...client }
        );

        return this.clients.get(
            client.clientId
        );
    }

    remove(clientId) {
        return this.clients.delete(
            clientId
        );
    }

    get(clientId) {
        return this.clients.get(
            clientId
        ) || null;
    }

    getByNick(nick) {
        if (!nick) {
            return null;
        }

        for (const client of this.clients.values()) {
            if (client.nick === nick) {
                return client;
            }
        }

        return null;
    }

    update(clientId, updates) {
    const client =
        this.clients.get(clientId);

    if (!client) {
        return null;
    }

    Object.assign(
        client,
        updates
    );

    return client;
}

    has(clientId) {
        return this.clients.has(
            clientId
        );
    }

    values() {
        return this.clients.values();
    }

    size() {
        return this.clients.size;
    }

    getServerId(clientId) {
        const client =
            this.get(clientId);

        return client?.serverId || null;
    }
}

module.exports = RemoteClientRegistry;