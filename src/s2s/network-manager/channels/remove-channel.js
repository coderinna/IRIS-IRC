// src/s2s/network-manager/channels/remove-channel.js

module.exports = function removeChannel(
    networkManager,
    name
) {
    return networkManager.channels.delete(
        name
    );
};