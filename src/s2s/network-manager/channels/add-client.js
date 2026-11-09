// src/s2s/network-manager/channels/add-client.js

const addChannel = require('./add-channel');

module.exports = function addClient(
    networkManager,
    channelName,
    client
) {
    if (!channelName) {
        throw new Error('Channel name is required');
    }

    if (!client) {
        throw new Error('Client is required');
    }

    let channel = networkManager.channels.get(channelName);

    if (!channel) {
        channel = addChannel(networkManager, {
            name: channelName
        });
    }

    const existingClient = [...channel.clients].find(
        member =>
            member.serverId === client.serverId &&
            member.clientId === client.clientId
    );

    if (existingClient) {
        return false;
    }

    channel.clients.add(client);

    if (client.serverId) {
        channel.servers.add(client.serverId);

        if (!channel.ownerServerId) {
            channel.ownerServerId = client.serverId;
        }
    }

    // Restore operator privilege
    if (Array.isArray(channel.operatorState)) {
        if (channel.operatorState.some(entry =>
            entry.serverId === client.serverId &&
            entry.clientId === client.clientId
        )) {
            channel.operators.add(client);
        }
    }

    // Restore voice privilege
    if (Array.isArray(channel.voicedState)) {
        if (channel.voicedState.some(entry =>
            entry.serverId === client.serverId &&
            entry.clientId === client.clientId
        )) {
            channel.voiced.add(client);
        }
    }

    channel.state = 'active';

    return true;
};