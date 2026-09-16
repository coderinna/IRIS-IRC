const numeric =
    require('./numeric.js');

module.exports = function cannotSendToChannel(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '404',
        nick,
        `${channel} :Cannot send to channel`
    );
};