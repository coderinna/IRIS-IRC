
// src/s2s/routing/resolvers/channel.js

module.exports = function resolveChannel(
    target,
    networkManager
) {
    console.log(
        `[ROUTE] CHANNEL LOOKUP target=${target} ` +
        `channels=${networkManager.getChannels().map(channel => channel.name).join(',')}`
    );

    const channel =
        networkManager.getChannel(target);

    if (!channel) {
        return null;
    }

    return {
        type: 'channel',
        channel,
        clients: [...channel.clients]
    };
};