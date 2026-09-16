const numeric =
    require('./numeric.js');

module.exports = function yourHost(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '002',
        nick,
        `:Your host is ${serverName}`
    );
};