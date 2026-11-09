
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

        if (!connection.manager?.networkManager) {
            throw new Error(
                'Network manager is not available'
            );
        }

        if (!connection.remote?.serverId) {
            throw new Error(
                'Remote server identity is not available'
            );
        }

const networkManager = connection.manager.networkManager;

// Tarkistetaan kaikki jäsenet ennen kanavatilan muuttamista.
const resolvedMembers = channelState.members.map(member => {
    const remoteClient = networkManager.getClient(
        member.serverId,
        member.clientId
    );

    if (!remoteClient) {
        throw new Error(
            `CHANNEL_STATE unknown client ${member.clientId} server=${member.serverId}`
        );
    }

    return remoteClient;
});

let channel = networkManager.getChannel(channelState.channel);

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
            channel.state =
                state.state || 'active';

            channel.modes =
                new Set(
                    Array.isArray(state.modes)
                        ? state.modes
                        : []
                );

            channel.key =
                state.key || null;

            channel.limit =
                Number.isInteger(state.limit) &&
                state.limit > 0
                    ? state.limit
                    : null;
        } else {
            channel.state =
                state || 'active';

            channel.modes = new Set();
            channel.key = null;
            channel.limit = null;
        }

        channel.servers.clear();
        channel.clients.clear();
        channel.operators = new Set();

        for (
            const serverId
            of channelState.servers
        ) {
            channel.servers.add(serverId);
        }

for (const remoteClient of resolvedMembers) {
    networkManager.addClientToChannel(
        channelState.channel,
        remoteClient
    );
}

        for (
            const operator
            of state?.operators || []
        ) {
            const operatorClient =
                networkManager.getClient(
                    operator.serverId,
                    operator.clientId
                );

            if (
                operatorClient &&
                channel.clients.has(operatorClient)
            ) {
                channel.operators.add(
                    operatorClient
                );
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
