module.exports = function handleNoExternalMessages(channel, adding) {
    if (adding) {
        channel.addMode('n');
    } else {
        channel.removeMode('n');
    }

    return true;
};