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

    // User mode
    if (target === client.nick) {
        const mode = params[1] || '';

        // +i = invisible
        if (mode === '+i') {
            client.send(
                `:${serverName} 221 ${client.nick} +i`
            );
            return;
        }

        // Ignore unsupported user modes for now
        client.send(
            `:${serverName} 221 ${client.nick} +i`
        );

        return;
    }

    // Channel modes
    if (target.startsWith('#')) {
        const channel = getChannel(target);

        if (!channel) {
            client.send(
                `:${serverName} 403 ${client.nick} ${target} :No such channel`
            );
            return;
        }

        return;
    }
}

module.exports = handleMode;