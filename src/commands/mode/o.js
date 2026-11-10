module.exports = function handleOperator(channel, adding, modeParam, targetClient) {
    if (!targetClient) {
        return false;
    }

    if (adding) {
        channel.addOperator(targetClient);
    } else {
        channel.removeOperator(targetClient);
    }

    return true;
};