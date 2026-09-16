const numeric =
    require('./numeric.js');

module.exports = function whoReply(
    serverName,
    nick,
    channel,
    client
) {
    return numeric(
        serverName,
        '352',
        nick,
        `${channel} ${client.user} localhost ${serverName} ${client.nick} H :0 ${client.nick}`
    );
};