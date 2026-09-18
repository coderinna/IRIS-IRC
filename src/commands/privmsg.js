const events = require('../events');

function handlePrivmsg(
    client,
    target,
    message,
    getClientByNick,
    getChannel,
    getRemoteClientByNick
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

        events.emit('message:sent', {
    client,
    target,
    message,
    type: 'channel'
});

        return;
    }

let targetClient =
    getClientByNick(target);

const remoteClient =
    getRemoteClientByNick
        ? getRemoteClientByNick(target)
        : null;

if (!targetClient && !remoteClient) {
    client.send(
        `:irc.iris.local 401 ${client.nick} ${target} :No such nick`
    );

    return;
}

if (remoteClient) {
    events.emit('message:sent', {
        client,
        target: remoteClient.nick,
        message,
        type: 'private'
    });

    return;
}

    targetClient.send(
        `:${client.mask} PRIVMSG ${targetClient.nick} :${message}`
    );

    events.emit('message:sent', {
    client,
    target: targetClient,
    message,
    type: 'private'
});
}

module.exports = handlePrivmsg;