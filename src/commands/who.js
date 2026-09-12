function handleWho(
    client,
    target,
    getChannel,
    serverName = 'irc.iris.local'
) {
    if (!target) {
        return;
    }

    const channel = getChannel(target);

    if (!channel) {
        client.send(
            `:${serverName} 315 ${client.nick} ${target} :End of /WHO list`
        );

        return;
    }

    for (const member of channel.clients) {
        client.send(
            `:${serverName} 352 ${client.nick} ${target} ` +
            `${member.user} localhost ${serverName} ` +
            `${member.nick} H :0 ${member.nick}`
        );
    }

    client.send(
        `:${serverName} 315 ${client.nick} ${target} :End of /WHO list`
    );
}

module.exports = handleWho;