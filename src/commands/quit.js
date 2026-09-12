const events = require('../events');

function handleQuit(
    client,
    reason,
    deleteChannel
) {
    const quitReason = reason || 'Quit';

    events.emit('client:quit', {
    client,
    reason: quitReason
});

    for (const channel of [...client.channels]) {
        channel.broadcast(
            `:${client.mask} QUIT :${quitReason}`,
            client
        );

        channel.removeClient(client);

        if (channel.isEmpty()) {
            deleteChannel(channel.name);
        }
    }

    client.socket.end();
}

module.exports = handleQuit;