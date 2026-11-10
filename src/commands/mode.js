function handleMode(
    client,
    params,
    getChannel,
    serverName
) {
    if (!params || params.length === 0) {
        return;
    }

    const target = params[0];
    const mode = params[1] || '';

    // User mode
    if (target === client.nick) {
        // MODE nick
        if (!mode) {
            client.send(
                `:${serverName} 221 ${client.nick} +i`
            );
            return;
        }

        // +i
        if (mode === '+i') {
            client.send(
                `:${serverName} 221 ${client.nick} +i`
            );
            return;
        }

        // -i
        if (mode === '-i') {
            client.send(
                `:${serverName} 221 ${client.nick} -i`
            );
            return;
        }

        return;
    }

    // Channel mode
    if (target.startsWith('#')) {
        const channel = getChannel(target);

        if (!channel) {
            client.send(
                `:${serverName} 403 ${client.nick} ${target} :No such channel`
            );
            return;
        }


        // MODE #channel
        if (!mode) {
            const modes = channel.getModes().join('');

            client.send(
                `:${serverName} 324 ${client.nick} ${target} +${modes}`
            );

            return;
        }


        if (!channel.isOperator(client)) {
    client.send(
        `:${serverName} 482 ${client.nick} ${target} :You're not channel operator`
    );
    return;
}

        // +i
        if (mode === '+i') {
            channel.addMode('i');

            channel.broadcast(
                `:${client.nick}!${client.user}@${client.host} MODE ${target} +i`
            );

            return;
        }

        // -i
        if (mode === '-i') {
            channel.removeMode('i');

            channel.broadcast(
                `:${client.nick}!${client.user}@${client.host} MODE ${target} -i`
            );

            return;
        }

        return;
    }
}

module.exports = handleMode;