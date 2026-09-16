const numeric =
    require('./numeric.js');

module.exports = function myInfo(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '004',
        nick,
        `${serverName} iris-irc 0`
    );
};