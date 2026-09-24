// src/s2s/network-manager/channels/update-state.js

module.exports = function updateState(
    networkManager,
    channelName
) {
    const channel =
        networkManager.channels.get(
            channelName
        );

    if (!channel) {
        return false;
    }

    if (channel.clients.size === 0) {
        channel.state = 'empty';
        return true;
    }

    channel.state = 'active';

    return true;
};