function addClient(channel, client) {
    if (channel.clients.has(client)) {
        return false;
    }

    channel.clients.add(client);
    client.addChannel(channel);

    return true;
}

function removeClient(channel, client) {
    if (!channel.clients.has(client)) {
        return false;
    }

    channel.clients.delete(client);
    client.removeChannel(channel);

    return true;
}

function hasClient(channel, client) {
    return channel.clients.has(client);
}

function getMembers(channel) {
    return [...channel.clients];
}

function getNicknames(channel) {
    return [...channel.clients]
        .map(client => client.nick)
        .filter(Boolean);
}

function isEmpty(channel) {
    return channel.clients.size === 0;
}

module.exports = {
    addClient,
    removeClient,
    hasClient,
    getMembers,
    getNicknames,
    isEmpty
};
