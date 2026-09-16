const numeric =
    require('./numeric.js');

module.exports = function nicknameInUse(
    serverName,
    nick,
    requestedNick
) {
    return numeric(
        serverName,
        '433',
        nick,
        `${requestedNick} :Nickname is already in use`
    );
};