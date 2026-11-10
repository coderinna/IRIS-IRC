module.exports = function handleTopicLock(channel, adding) {
    if (adding) {
        channel.addMode('t');
    } else {
        channel.removeMode('t');
    }

    return true;
};