// src/s2s/network-manager/channels/get-channels.js

module.exports = function getChannels(
    networkManager
) {
    return [
        ...networkManager.channels.values()
    ];
};