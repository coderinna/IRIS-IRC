function handleNotice(
    client,
    target,
    message,
    clients,
    channels,
    serverName
) {
    if (!target || !message) {
        return;
    }

    const fullMessage =
        `:${client.mask} NOTICE ${target} :${message}`;

    // Channel message
    if (target.startsWith('#')) {
        const channel = channels.get(target);

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
    const targetClient = [...clients].find(
        other =>
            other.nick &&
            other.nick.toLowerCase() === target.toLowerCase()
    );

    if (!targetClient) {
        return;
    }

    targetClient.send(fullMessage);
}

module.exports = handleNotice;