function handleNotice(
    client,
    target,
    message,
    getClientByNick,
    getChannel
) {
    if (!target || !message) {
        return;
    }

    const fullMessage =
        `:${client.mask} NOTICE ${target} :${message}`;

    // Channel message
    if (target.startsWith('#')) {
        const channel = getChannel(target);

        if (!channel) {
            return;
        }

        channel.broadcast(
            fullMessage,
            client
        );

        return;
    }

    // Direct user message
    const targetClient = getClientByNick(target);

    if (!targetClient) {
        return;
    }

    targetClient.send(fullMessage);
}

module.exports = handleNotice;