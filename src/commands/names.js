// src/commands/names.js

function handleNames(
    client,
    channelName,
    getChannel,
    networkManager,
    serverName
) {
    if (!channelName) {
        return;
    }

    const channel =
        getChannel(channelName);

    const networkChannel =
        networkManager?.getChannel(channelName);

    const localNicknames =
        channel
            ? channel.getNicknames()
            : [];

    const networkNicknames =
        networkChannel
            ? [...networkChannel.clients]
                .map(member => member.nick)
                .filter(Boolean)
            : [];

    const nicknames = [
        ...new Set([
            ...localNicknames,
            ...networkNicknames
        ])
    ];

    client.send(
        `:${serverName} 353 ${client.nick} = ${channelName} :${nicknames.join(' ')}`
    );

    client.send(
        `:${serverName} 366 ${client.nick} ${channelName} :End of /NAMES list`
    );
}

module.exports = handleNames;