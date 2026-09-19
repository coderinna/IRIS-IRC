// src/s2s/network-manager/channels/index.js

const addChannel = (networkManager, channel) => {
    if (!channel || !channel.name) {
        throw new Error(
            'Channel name is required'
        );
    }

    if (networkManager.channels.has(channel.name)) {
        return networkManager.channels.get(
            channel.name
        );
    }

    const remoteChannel = {
        name: channel.name,
        topic: channel.topic || null,
        clients: new Set()
    };

    networkManager.channels.set(
        channel.name,
        remoteChannel
    );

    return remoteChannel;
};


const removeChannel = (
    networkManager,
    name
) => {
    return networkManager.channels.delete(name);
};


const getChannel = (
    networkManager,
    name
) => {
    return networkManager.channels.get(name) || null;
};


const getChannels = (
    networkManager
) => {
    return [...networkManager.channels.values()];
};


const addClient = (
    networkManager,
    channelName,
    client
) => {
    if (!channelName) {
        throw new Error(
            'Channel name is required'
        );
    }

    if (!client) {
        throw new Error(
            'Client is required'
        );
    }

    let channel =
        networkManager.channels.get(
            channelName
        );

    if (!channel) {
        channel = addChannel(
            networkManager,
            {
                name: channelName
            }
        );
    }

    if (channel.clients.has(client)) {
        return false;
    }

    channel.clients.add(client);

    return true;
};


const removeClient = (
    networkManager,
    channelName,
    client
) => {
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


module.exports = {
    addChannel,
    removeChannel,
    getChannel,
    getChannels,
    addClient,
    removeClient
};