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

    if (!removed) {
        return false;
    }

    if (client.serverId) {
        const hasServerMembers =
            [...channel.clients].some(
                remoteClient =>
                    remoteClient.serverId ===
                    client.serverId
            );

        if (!hasServerMembers) {
            channel.servers.delete(
                client.serverId
            );
        }
    }

    networkManager.updateChannelState(
        channelName
    );

    return true;
};