const numeric =
    require('./numeric.js');

module.exports = function notOnChannel(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '442',
        nick,
        `${channel} :You're not on that channel`
    );
};