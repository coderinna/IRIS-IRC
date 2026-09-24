// src/s2s/network-manager/channels/add-channel.js

module.exports = function addChannel(
    networkManager,
    channel
) {
    if (!channel || !channel.name) {
        throw new Error(
            'Channel name is required'
        );
    }

    if (
        networkManager.channels.has(
            channel.name
        )
    ) {
        return networkManager.channels.get(
            channel.name
        );
    }

    const remoteChannel = {
        name: channel.name,
        topic: channel.topic || null,
        clients: new Set(),
        servers: new Set(),
        ownerServerId:
            channel.ownerServerId || null,
        state: 'active'
    };

    networkManager.channels.set(
        channel.name,
        remoteChannel
    );

    return remoteChannel;
};