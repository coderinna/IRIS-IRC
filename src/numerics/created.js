const numeric =
    require('./numeric.js');

module.exports = function created(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '003',
        nick,
        ':This server was created today'
    );
};