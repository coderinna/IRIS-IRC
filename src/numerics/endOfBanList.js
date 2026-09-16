const numeric =
    require('./numeric.js');

module.exports = function endOfBanList(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '368',
        nick,
        `${channel} :End of channel ban list`
    );
};