function handleJoin(client, names, getOrCreateChannel) {
    if (!client.registered) {
        return;
    }

    if (!names) {
        return;
    }

    for (const channelName of names.split(',')) {
        if (!channelName.startsWith('#')) {
            client.send(
                `:irc.iris.local 403 ${client.nick} ${channelName} :No such channel`
            );

            continue;
        }

        const channel = getOrCreateChannel(channelName);

        if (client.isInChannel(channel)) {
            continue;
        }

        channel.addClient(client);

        channel.broadcast(
            `:${client.mask} JOIN ${channel.name}`
        );

        client.send(
            `:irc.iris.local 353 ${client.nick} = ${channel.name} :${channel
                .getNicknames()
                .join(' ')}`
        );

        client.send(
            `:irc.iris.local 366 ${client.nick} ${channel.name} :End of /NAMES list`
        );
    }
}

module.exports = handleJoin;