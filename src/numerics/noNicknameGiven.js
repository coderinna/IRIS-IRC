const numeric =
    require('./numeric.js');

module.exports = function noNicknameGiven(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '431',
        nick,
        ':No nickname given'
    );
};