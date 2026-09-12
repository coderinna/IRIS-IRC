function handlePart(client, names, reason, channels) {
    if (!names) {
        return;
    }

    for (const channelName of names.split(',')) {
        const channel = channels.get(channelName);

        if (!channel || !channel.hasClient(client)) {
            client.send(
                `:irc.iris.local 442 ${client.nick} ${channelName} :You're not on that channel`
            );

            continue;
        }

        const message =
            `:${client.mask} PART ${channel.name}` +
            (reason ? ` :${reason}` : '');

        channel.broadcast(message);

        channel.removeClient(client);

        if (channel.isEmpty()) {
            channels.delete(channel.name);
        }
    }
}

module.exports = handlePart;