const numeric =
    require('./numeric.js');

module.exports = function noSuchChannel(
    serverName,
    nick,
    channel
) {
    return numeric(
        serverName,
        '403',
        nick,
        `${channel} :No such channel`
    );
};