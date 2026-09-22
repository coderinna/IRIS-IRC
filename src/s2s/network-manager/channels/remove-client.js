// src/s2s/network-manager/channels/remove-client.js

module.exports = function removeClient(
    networkManager,
    channelName,
    client
) {
    const channel =
        networkManager.channels.get(
            channelName
        );

    if (!channel) {
        return false;
    }

    const removed =
        channel.clients.delete(client);

    if (
        channel.clients.size === 0
    ) {
        networkManager.channels.delete(
            channelName
        );
    }

    return removed;
};