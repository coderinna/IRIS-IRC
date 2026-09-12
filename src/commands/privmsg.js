function handlePrivmsg(client, target, message, clients, channels) {
    if (!target || !message) {
        return;
    }

    if (target.startsWith('#')) {
        const channel = channels.get(target);

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

    const targetClient = [...clients].find(
        other =>
            other.nick &&
            other.nick.toLowerCase() === target.toLowerCase()
    );

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