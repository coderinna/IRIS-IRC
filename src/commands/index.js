
// keskitetty komento keskus
const handleStats = require('./stats');
const handleNotice = require('./notice');
const handleCap = require('./cap');
const handleNick = require('./nick');
const handleUser = require('./user');
const handlePing = require('./ping');
const handleJoin = require('./join');
const handlePart = require('./part');
const handlePrivmsg = require('./privmsg');
const handleQuit = require('./quit');
const handleMode = require('./mode');
const handleWho = require('./who');
const handleNames = require('./names');

const commands = {
    STATS: handleStats,
    CAP: handleCap,
    NICK: handleNick,
    USER: handleUser,
    PING: handlePing,
    PONG: () => {},
    JOIN: handleJoin,
    PART: handlePart,
    PRIVMSG: handlePrivmsg,
    QUIT: handleQuit,
    MODE: handleMode,
    WHO: handleWho,
    NOTICE: handleNotice,
    NAMES: handleNames,
};

function getCommand(command) {
    return commands[command.toUpperCase()];
}

module.exports = {
    commands,
    getCommand
};