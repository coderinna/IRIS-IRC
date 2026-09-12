function handleQuit(client, reason, clients, channels) {
    const quitReason = reason || 'Quit';

    for (const channel of [...client.channels]) {
        channel.broadcast(
            `:${client.mask} QUIT :${quitReason}`,
            client
        );

        channel.removeClient(client);

        if (channel.isEmpty()) {
            channels.delete(channel.name);
        }
    }

    clients.delete(client);

    client.socket.end();
}

module.exports = handleQuit;