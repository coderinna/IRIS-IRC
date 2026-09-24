// src/s2s/network-manager/channels/remove-channel.js

module.exports = function removeChannel(
    networkManager,
    name
) {
    const channel =
        networkManager.channels.get(
            name
        );

    if (!channel) {
        return false;
    }

    if (channel.clients.size > 0) {
        return false;
    }

    channel.state = 'removed';

    networkManager.channels.delete(
        name
    );

    return true;
};