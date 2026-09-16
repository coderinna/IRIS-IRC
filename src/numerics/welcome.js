const numeric =
    require('./numeric.js');

module.exports = function welcome(
    serverName,
    nick
) {
    return numeric(
        serverName,
        '001',
        nick,
        ':Welcome to Iris IRC'
    );
};