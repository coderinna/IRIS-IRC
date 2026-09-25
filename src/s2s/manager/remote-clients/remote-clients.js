// src/s2s/manager/remote-clients/remote-clients.js //

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

        const key =
            this.getKey(
                client.serverId,
                client.clientId
            );
console.log(
    `[REMOTE CLIENT] ADD key=${key} ` +
    `serverId=${client.serverId} ` +
    `clientId=${client.clientId} ` +
    `nick=${client.nick}`
);
        this.clients.set(
            key,
            { ...client }
        );

        return this.clients.get(key);
    }

    remove(serverId, clientId) {
        return this.clients.delete(
            this.getKey(
                serverId,
                clientId
            )
        );
    }

    get(serverId, clientId) {
        return this.clients.get(
            this.getKey(
                serverId,
                clientId
            )
        ) || null;
    }

    getByNick(nick) {
        if (!nick) {
            return null;
        }

        for (const client of this.clients.values()) {
            if (
                client.nick &&
                client.nick.toLowerCase() ===
                nick.toLowerCase()
            ) {
                return client;
            }
        }

        return null;
    }

    update(serverId, clientId, updates) {
        const client =
            this.get(
                serverId,
                clientId
            );

        if (!client) {
            return null;
        }

        Object.assign(
            client,
            updates
        );

        return client;
    }

    has(serverId, clientId) {
        return this.clients.has(
            this.getKey(
                serverId,
                clientId
            )
        );
    }

    values() {
        return this.clients.values();
    }

    size() {
        return this.clients.size;
    }

    getServerId(serverId, clientId) {
        const client =
            this.get(
                serverId,
                clientId
            );

        return client?.serverId || null;
    }
}

module.exports = RemoteClientRegistry;