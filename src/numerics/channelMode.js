const numeric =
    require('./numeric.js');

module.exports = function channelMode(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '324',
        nick,
        `${channel} +`
    );
};