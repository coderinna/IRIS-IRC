// src/commands/join.js

const events = require('../events');

function handleJoin(
    client,
    names,
    getOrCreateChannel,
    getChannel,
    serverName,
    networkManager
) {
    if (!client.registered) {
        return;
    }

    if (!names) {
        return;
    }

    for (const channelName of names.split(',')) {
        if (!channelName.startsWith('#')) {
            client.send(
                `:irc.iris.local 403 ${client.nick} ${channelName} :No such channel`
            );

            continue;
        }

const existingChannel = getChannel(channelName);
const channel = existingChannel || getOrCreateChannel(channelName);

const isNewChannel = !existingChannel;

        if (client.isInChannel(channel)) {
            continue;
        }

        // +i: Invite-only
if (channel.hasMode('i')) {
    client.send(
        `:${serverName} 473 ${client.nick} ${channel.name} :Cannot join channel (+i)`
    );
    continue;
}

// +k: Channel key
if (channel.hasMode('k')) {
    const suppliedKey = paramsKeyPlaceholder;
}

        channel.addClient(client);

        if (isNewChannel) {
    channel.addOperator(client);
}

        events.emit('channel:joined', {
    client,
    channel
});

        channel.broadcast(
            `:${client.mask} JOIN ${channel.name}`
        );

const remoteChannel =
    networkManager?.getChannel(
        channel.name
    );

    console.log(
    `[IRIS DEBUG] NAMES channel=${channel.name} ` +
    `networkMembers=${remoteChannel ? [...remoteChannel.clients].map(member => `${member.nick}@${member.serverId}`).join(', ') : 'NONE'}`
);

const networkNicknames =
    remoteChannel
        ? [...remoteChannel.clients]
            .map(member => member.nick)
            .filter(Boolean)
        : [];

const localNicknames =
    channel.getMembers().map(member =>
        channel.isOperator(member)
            ? `@${member.nick}`
            : member.nick
    ).filter(Boolean);

const nicknames = [
    ...new Set([
        ...localNicknames,
        ...networkNicknames
    ])
];

client.send(
    `:${serverName} 353 ${client.nick} = ${channel.name} :${nicknames.join(' ')}`
);

        client.send(
            `:irc.iris.local 366 ${client.nick} ${channel.name} :End of /NAMES list`
        );
    }
}

module.exports = handleJoin;