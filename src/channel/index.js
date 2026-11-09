// src/channel/index.js

class Channel {
    constructor(name, ownerServerId = null) {
        this.name = name;
        this.topic = null;

        this.clients = new Set();
        this.servers = new Set();
        this.modes = new Set();

        this.key = null;
this.limit = null;

        this.ownerServerId = ownerServerId;
        this.state = 'active';

        this.operators = new Set();
    }

// src/channel/index.js

addClient(client) {
    if (!client || !client.id || !client.serverId) {
        return false;
    }

    const existingClient = [...this.clients].find(
        member =>
            member.id === client.id &&
            member.serverId === client.serverId
    );

    if (existingClient) {
        return false;
    }

    this.clients.add(client);
    client.channels.add(this);

    this.servers.add(client.serverId);

    return true;
}

addOperator(client) {
    if (!client || this.operators.has(client)) {
        return false;
    }

    this.operators.add(client);
    return true;
}

removeOperator(client) {
    return this.operators.delete(client);
}

isOperator(client) {
    return this.operators.has(client);
}

getOperators() {
    return [...this.operators];
}

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
    return {
        state: this.state,
        modes: this.getModes(),
        operators: this.getOperators().map(client => ({
            clientId: client.id,
            serverId: client.serverId
        }))
    };
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

    hasMode(mode) {
    return this.modes.has(mode);
}

addMode(mode) {
    if (!mode || this.modes.has(mode)) {
        return false;
    }

    this.modes.add(mode);
    return true;
}

removeMode(mode) {
    return this.modes.delete(mode);
}

getModes() {
    return [...this.modes];
}

// Channel key (+k)
setKey(key) {
    this.key = key || null;
}

getKey() {
    return this.key;
}

hasKey() {
    return Boolean(this.key);
}

// Channel user limit (+l)
setLimit(limit) {
    const value = Number(limit);

    if (!Number.isInteger(value) || value < 1) {
        return false;
    }

    this.limit = value;
    return true;
}

getLimit() {
    return this.limit;
}

hasLimit() {
    return this.limit !== null;
}

removeLimit() {
    this.limit = null;
}
}

module.exports = Channel;