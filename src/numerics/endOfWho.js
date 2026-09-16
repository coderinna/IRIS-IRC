const numeric =
    require('./numeric.js');

module.exports = function endOfWho(
    serverName,
    nick,
    target
) {
    return numeric(
        serverName,
        '315',
        nick,
        `${target} :End of /WHO list`
    );
};