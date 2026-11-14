
// src/s2s/network-manager/channels/add-channel.js

const Channel = require('../../../channel');

module.exports = function addChannel(
    networkManager,
    channel
) {
    if (!channel || !channel.name) {
        throw new Error(
            'Channel name is required'
        );
    }

    if (networkManager.channels.has(channel.name)) {
        return networkManager.channels.get(channel.name);
    }

    const remoteChannel = new Channel(
        channel.name,
        channel.ownerServerId || null
    );

    remoteChannel.topic = channel.topic || null;
    remoteChannel.state = channel.state || 'active';

    if (Array.isArray(channel.modes)) {
        remoteChannel.modes = new Set(channel.modes);
    }

    remoteChannel.key = channel.key || null;
    remoteChannel.limit = channel.limit || null;

    networkManager.channels.set(
        channel.name,
        remoteChannel
    );

    return remoteChannel;
};
