const events = require('../events');

function handlePart(
    client,
    names,
    reason,
    getChannel,
    deleteChannel
) {
    if (!names) {
        return;
    }

    for (const channelName of names.split(',')) {
        const channel = getChannel(channelName);

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

        events.emit('channel:parted', {
    client,
    channel,
    reason
});

        if (channel.isEmpty()) {
            deleteChannel(channel.name);
        }
    }
}

module.exports = handlePart;