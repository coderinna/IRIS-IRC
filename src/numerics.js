function numeric(serverName, code, nick, message = '') {
    return `:${serverName} ${code} ${nick || '*'}${message ? ` ${message}` : ''}`;
}

function welcome(serverName, nick) {
    return numeric(
        serverName,
        '001',
        nick,
        ':Welcome to Iris IRC'
    );
}

function yourHost(serverName, nick) {
    return numeric(
        serverName,
        '002',
        nick,
        `:Your host is ${serverName}`
    );
}

function created(serverName, nick) {
    return numeric(
        serverName,
        '003',
        nick,
        ':This server was created today'
    );
}

function myInfo(serverName, nick) {
    return numeric(
        serverName,
        '004',
        nick,
        `${serverName} iris-irc 0`
    );
}

function noSuchChannel(serverName, nick, channel) {
    return numeric(
        serverName,
        '403',
        nick,
        `${channel} :No such channel`
    );
}

function cannotSendToChannel(serverName, nick, channel) {
    return numeric(
        serverName,
        '404',
        nick,
        `${channel} :Cannot send to channel`
    );
}

function noSuchNick(serverName, nick, target) {
    return numeric(
        serverName,
        '401',
        nick,
        `${target} :No such nick`
    );
}

function nicknameInUse(serverName, nick, requestedNick) {
    return numeric(
        serverName,
        '433',
        nick,
        `${requestedNick} :Nickname is already in use`
    );
}

function noNicknameGiven(serverName, nick) {
    return numeric(
        serverName,
        '431',
        nick,
        ':No nickname given'
    );
}

function notOnChannel(serverName, nick, channel) {
    return numeric(
        serverName,
        '442',
        nick,
        `${channel} :You're not on that channel`
    );
}

function namesReply(serverName, nick, channel, names) {
    return numeric(
        serverName,
        '353',
        nick,
        `= ${channel} :${names}`
    );
}

function endOfNames(serverName, nick, channel) {
    return numeric(
        serverName,
        '366',
        nick,
        `${channel} :End of /NAMES list`
    );
}

function userMode(serverName, nick) {
    return numeric(
        serverName,
        '221',
        nick,
        '+i'
    );
}

function channelMode(serverName, nick, channel) {
    return numeric(
        serverName,
        '324',
        nick,
        `${channel} +`
    );
}

function endOfBanList(serverName, nick, channel) {
    return numeric(
        serverName,
        '368',
        nick,
        `${channel} :End of channel ban list`
    );
}

function whoReply(serverName, nick, channel, client) {
    return numeric(
        serverName,
        '352',
        nick,
        `${channel} ${client.user} localhost ${serverName} ${client.nick} H :0 ${client.nick}`
    );
}

function endOfWho(serverName, nick, target) {
    return numeric(
        serverName,
        '315',
        nick,
        `${target} :End of /WHO list`
    );
}

function unknownCommand(serverName, nick, command) {
    return numeric(
        serverName,
        '421',
        nick,
        `${command} :Unknown command`
    );
}

module.exports = {
    numeric,
    welcome,
    yourHost,
    created,
    myInfo,
    noSuchChannel,
    cannotSendToChannel,
    noSuchNick,
    nicknameInUse,
    noNicknameGiven,
    notOnChannel,
    namesReply,
    endOfNames,
    userMode,
    channelMode,
    endOfBanList,
    whoReply,
    endOfWho,
    unknownCommand
};