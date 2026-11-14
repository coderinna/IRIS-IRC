module.exports = function handleVoice(channel, adding, modeParam, targetClient) {
    if (!targetClient) {
        return false;
    }

    if (adding) {
        channel.addVoice(targetClient);
    } else {
        channel.removeVoice(targetClient);
    }

    return true;
};