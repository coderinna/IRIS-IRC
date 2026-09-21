// src/commands/notice.js

const events = require('../events');

function handleNotice(
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

        events.emit('message:sent', {
            client,
            target,
            message,
            type: 'notice'
        });

        return;
    }

    // Remote user
    const remoteClient =
        getRemoteClientByNick
            ? getRemoteClientByNick(target)
            : null;

    if (remoteClient) {
        events.emit('message:sent', {
            client,
            target: remoteClient.nick,
            message,
            type: 'notice'
        });

        return;
    }

    // Local user
    const targetClient =
        getClientByNick(target);

    if (!targetClient) {
        return;
    }

    targetClient.send(fullMessage);

    events.emit('message:sent', {
        client,
        target: targetClient,
        message,
        type: 'notice'
    });
}

module.exports = handleNotice;