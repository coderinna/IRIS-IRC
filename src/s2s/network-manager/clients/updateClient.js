module.exports = function updateClient(
    manager,
    serverId,
    clientId,
    updates
) {
    if (
        !serverId ||
        !clientId ||
        !updates
    ) {
        return null;
    }

    const key =
        `${serverId}:${clientId}`;

    const client =
        manager.clients.get(key);

    if (!client) {
        return null;
    }

    if (updates.nick !== undefined) {
        client.nick = updates.nick;
    }

    if (updates.user !== undefined) {
        client.user = updates.user;
    }

    if (updates.host !== undefined) {
        client.host = updates.host;
    }

    return client;
};