// src/s2s/network-manager/channels/add-client.js

const addChannel =
    require('./add-channel');

module.exports = function addClient(
    networkManager,
    channelName,
    client
) {
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