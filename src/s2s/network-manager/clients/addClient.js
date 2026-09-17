module.exports = function addClient(
    manager,
    client
) {
    if (
        !client ||
        !client.serverId ||
        !client.clientId
    ) {
        throw new Error(
            'Invalid remote client definition'
        );
    }

    const key =
        `${client.serverId}:${client.clientId}`;

    if (manager.clients.has(key)) {
        throw new Error(
            `Remote client already exists: ${key}`
        );
    }

const entry = {
    clientId: client.clientId,
    serverId: client.serverId,
    nick: client.nick || null,
    user: client.user || null,
    host: client.host || null,
    connection: client.connection || null
};

    manager.clients.set(key, entry);

    return entry;
};