// src/s2s/protocol/types.js

const TYPES = {
    HELLO: 0x01,
    AUTH: 0x02,
    SERVER: 0x03,
    READY: 0x04,

    CLIENT: 0x10,
    NICK: 0x11,
    JOIN: 0x12,
    PART: 0x13,
    QUIT: 0x14,
    MESSAGE: 0x15,
    NOTICE: 0x16,
    CHANNEL_STATE: 0x17,
    MODE: 0x18,
    TOPIC: 0x19,

    PING: 0x20,
    PONG: 0x21,
    ACK: 0x22,
};

module.exports = {
    TYPES
};