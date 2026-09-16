const numeric =
    require('./numeric.js');

module.exports = function namesReply(
    serverName,
    nick,
    channel,
    names
) {
    return numeric(
        serverName,
        '353',
        nick,
        `= ${channel} :${names}`
    );
};