function getTopic(channel) {
    return channel.topic;
}

function setTopic(channel, topic) {
    channel.topic = topic || null;
}

function hasTopic(channel) {
    return Boolean(channel.topic);
}

module.exports = {
    getTopic,
    setTopic,
    hasTopic
};