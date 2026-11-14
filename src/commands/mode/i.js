module.exports = function handleInviteOnly(channel, adding) {
    if (adding) {
        channel.addMode('i');
    } else {
        channel.removeMode('i');
    }

    return true;
};