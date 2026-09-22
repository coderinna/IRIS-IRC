// src/s2s/network-manager/channels/get-channel.js

module.exports = function getChannel(
    networkManager,
    name
) {
    return (
        networkManager.channels.get(name) ||
        null
    );
};