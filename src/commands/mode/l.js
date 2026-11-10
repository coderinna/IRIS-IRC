module.exports = function handleLimit(channel, adding, modeParam) {
    if (adding) {
        if (!channel.setLimit(modeParam)) {
            return false;
        }

        channel.addMode('l');
    } else {
        channel.removeLimit();
        channel.removeMode('l');
    }

    return true;
};