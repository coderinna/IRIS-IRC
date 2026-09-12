
// keskitetty komento keskus

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

const commands = {
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
    WHO: handleWho
};

function getCommand(command) {
    return commands[command.toUpperCase()];
}

module.exports = {
    commands,
    getCommand
};