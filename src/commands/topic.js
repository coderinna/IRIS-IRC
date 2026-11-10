
// src/commands/topic.js

const events = require('../events');

function handleTopic(
    client,
    channelName,
    topic,
    getChannel,
    serverName
) {
    if (!channelName) {
        client.send(
            `:irc.iris.local 461 ${client.nick} TOPIC :Not enough parameters`
        );
        return;
    }

    const channel = getChannel(channelName);

    if (!channel) {
        client.send(
            `:irc.iris.local 403 ${client.nick} ${channelName} :No such channel`
        );
        return;
    }

    // TOPIC query
    if (topic === null || topic === undefined) {
        const currentTopic = channel.getTopic();

        if (currentTopic) {
            client.send(
                `:irc.iris.local 332 ${client.nick} ${channel.name} :${currentTopic}`
            );
        } else {
            client.send(
                `:irc.iris.local 331 ${client.nick} ${channel.name} :No topic is set`
            );
        }

        return;
    }

    // +t: only channel operators may change the topic
    if (channel.hasMode('t') && !channel.isOperator(client)) {
        client.send(
            `:irc.iris.local 482 ${client.nick} ${channel.name} :You're not channel operator`
        );
        return;
    }

    channel.setTopic(topic);

    const message =
        `:${client.mask} TOPIC ${channel.name} :${topic}`;

    channel.broadcast(message);

    events.emit('channel:topic', {
        client,
        channel,
        topic,
        serverName
    });
}

module.exports = handleTopic;
