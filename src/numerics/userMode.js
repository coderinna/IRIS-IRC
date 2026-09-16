const numeric =
    require('./numeric.js');

module.exports = function userMode(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '221',
        nick,
        '+i'
    );
};