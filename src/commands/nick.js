function handleNick(client, nick, clients, registerClient) {
    if (!nick) {
        client.send(
            `:irc.iris.local 431 ${client.nick || '*'} :No nickname given`
        );
        return;
    }

    const existing = [...clients].find(
        other =>
            other !== client &&
            other.nick &&
            other.nick.toLowerCase() === nick.toLowerCase()
    );

    if (existing) {
        client.send(
            `:irc.iris.local 433 ${client.nick || '*'} ${nick} :Nickname is already in use`
        );
        return;
    }

    // Initial nickname
    if (!client.nick) {
        client.nick = nick;
        registerClient(client);
        return;
    }

    // Nick change
    const oldNick = client.nick;

    const message =
        `:${oldNick}!${client.user}@localhost NICK :${nick}`;

    client.nick = nick;

    const notified = new Set();

    for (const channel of client.channels) {
        for (const member of channel.clients) {
            if (!notified.has(member)) {
                member.send(message);
                notified.add(member);
            }
        }
    }

    if (notified.size === 0) {
        client.send(message);
    }

    console.log(
        `[${client.id}] Nick changed: ${oldNick} -> ${nick}`
    );
}

module.exports = handleNick;