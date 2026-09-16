const numeric =
    require('./numeric.js');

module.exports = function unknownCommand(
    serverName,
    nick,
    command
) {
    return numeric(
        serverName,
        '421',
        nick,
        `${command} :Unknown command`
    );
};