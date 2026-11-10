module.exports = function handleKey(channel, adding, modeParam) {
    if (adding) {
        if (!modeParam) {
            return false;
        }

        channel.setKey(modeParam);
        channel.addMode('k');
    } else {
        channel.setKey(null);
        channel.removeMode('k');
    }

    return true;
};