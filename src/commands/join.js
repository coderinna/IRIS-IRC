// src/commands/join.js

const events = require('../events');

function handleJoin(
    client,
    names,
    keys,
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

    const channelNames = names.split(',');
const channelKeys = typeof keys === 'string' ? keys.split(',') : [];

   for (let i = 0; i < channelNames.length; i++) {
    const channelName = channelNames[i];
    const suppliedKey = channelKeys[i];
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
// +k: Channel key
if (channel.hasMode('k') && suppliedKey !== channel.getKey()) {
    client.send(
        `:${serverName} 475 ${client.nick} ${channel.name} :Cannot join channel (+k)`
    );
    continue;
}

// +l: Channel user limit
if (
    channel.hasMode('l') &&
    channel.hasLimit() &&
    channel.clients.size >= channel.getLimit()
) {
    client.send(
        `:${serverName} 471 ${client.nick} ${channel.name} :Cannot join channel (+l)`
    );
    continue;
}

console.log(
    `[IRIS DEBUG] JOIN ${channelName} ` +
    `isNewChannel=${isNewChannel} ` +
    `membersBefore=${channel.clients.size}`
);

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

const nicknameMap = new Map();

for (const member of channel.getMembers()) {
    if (!member.nick) continue;

    nicknameMap.set(
        member.nick,
        channel.isOperator(member)
            ? `@${member.nick}`
            : member.nick
    );
}

if (remoteChannel) {
    for (const member of remoteChannel.clients) {
        if (!member.nick) continue;

        const isOperator =
            remoteChannel.isOperator(member);

        const existing =
            nicknameMap.get(member.nick);

        if (isOperator || !existing) {
            nicknameMap.set(
                member.nick,
                isOperator
                    ? `@${member.nick}`
                    : member.nick
            );
        }
    }
}

const nicknames = [...nicknameMap.values()];

client.send(
    `:${serverName} 353 ${client.nick} = ${channel.name} :${nicknames.join(' ')}`
);

        client.send(
            `:irc.iris.local 366 ${client.nick} ${channel.name} :End of /NAMES list`
        );
    }
}

module.exports = handleJoin;