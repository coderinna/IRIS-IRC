
// src/s2s/connection/handlers/channel-state.js

const {
    decodeChannelState
} = require('../../messages/channel-state');

module.exports = function handleChannelState(
    connection,
    frame
) {
    try {
        const channelState =
            decodeChannelState(
                frame.payload
            );

        if (!connection.manager) {
            throw new Error(
                'S2S manager is not available'
            );
        }

        if (!connection.manager.networkManager) {
            throw new Error(
                'Network manager is not available'
            );
        }

        if (!connection.remote?.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

        const networkManager =
            connection.manager.networkManager;

        let channel =
            networkManager.getChannel(
                channelState.channel
            );

        if (!channel) {
            channel =
                networkManager.addChannel({
                    name: channelState.channel,
                    topic: channelState.topic,
                    ownerServerId:
                        channelState.ownerServerId
                });
        }

        channel.topic =
            channelState.topic;

        channel.ownerServerId =
            channelState.ownerServerId;

        const state = channelState.state;

        if (
            typeof state === 'object' &&
            state !== null
        ) {
            channel.state = state.state;
        } else {
            channel.state = state;
        }

        channel.servers.clear();
        channel.clients.clear();

        for (
            const serverId
            of channelState.servers
        ) {
            channel.servers.add(
                serverId
            );
        }

        for (
            const member
            of channelState.members
        ) {
            const remoteClient =
                networkManager.getClient(
                    member.serverId,
                    member.clientId
                );

            if (!remoteClient) {
                console.warn(
                    `[IRIS] CHANNEL_STATE ` +
                    `unknown client ` +
                    `${member.clientId} ` +
                    `server=${member.serverId}`
                );

                continue;
            }

            networkManager.addClientToChannel(
                channelState.channel,
                remoteClient
            );
        }

        // Restore channel modes
        if (
            typeof state === 'object' &&
            state !== null
        ) {
            channel.modes.clear();

            for (const mode of state.modes || []) {
                channel.addMode(mode);
            }

            // Restore channel operators
            channel.operators.clear();

            for (const operator of state.operators || []) {
                const operatorClient =
                    networkManager.getClient(
                        operator.serverId,
                        operator.clientId
                    );

                if (
                    operatorClient &&
                    channel.clients.has(operatorClient)
                ) {
                    channel.addOperator(
                        operatorClient
                    );
                }
            }
        }

        networkManager.updateChannelState(
            channelState.channel
        );

        console.log(
            `[IRIS] ← CHANNEL_STATE ` +
            `${channelState.channel} ` +
            `members=${channelState.members.length} ` +
            `servers=${channelState.servers.length}`
        );

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid CHANNEL_STATE:',
            error.message
        );

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};
