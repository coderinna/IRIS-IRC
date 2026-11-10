module.exports = function handleModerated(channel, adding) {
    if (adding) {
        channel.addMode('m');
    } else {
        channel.removeMode('m');
    }

    return true;
};