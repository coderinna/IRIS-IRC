const numeric =
    require('./numeric.js');

module.exports = function endOfNames(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '366',
        nick,
        `${channel} :End of /NAMES list`
    );
};