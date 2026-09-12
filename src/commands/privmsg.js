function handlePrivmsg(
    client,
    target,
    message,
    getClientByNick,
    getChannel
) {
    if (!target || !message) {
        return;
    }

    if (target.startsWith('#')) {
        const channel = getChannel(target);

        if (!channel || !channel.hasClient(client)) {
            client.send(
                `:irc.iris.local 404 ${client.nick} ${target} :Cannot send to channel`
            );

            return;
        }

        channel.broadcast(
            `:${client.mask} PRIVMSG ${target} :${message}`,
            client
        );

        return;
    }

    const targetClient = getClientByNick(target);

    if (!targetClient) {
        client.send(
            `:irc.iris.local 401 ${client.nick} ${target} :No such nick`
        );

        return;
    }

    targetClient.send(
        `:${client.mask} PRIVMSG ${targetClient.nick} :${message}`
    );
}

module.exports = handlePrivmsg;