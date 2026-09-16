const numeric =
    require('./numeric.js');

module.exports = function noSuchNick(
    serverName,
    nick,
    target
) {
    return numeric(
        serverName,
        '401',
        nick,
        `${target} :No such nick`
    );
};