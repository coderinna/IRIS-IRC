// src/s2s/connections/allowed-states.js

const {
    STATES
} = require('./states.js');

const {
    TYPES
} = require('../protocol/frame/frame.js');

const ALLOWED_STATES = {
    [TYPES.HELLO]: [
        STATES.CONNECTING,
        STATES.HELLO,
        STATES.AUTH
    ],

    [TYPES.AUTH]: [
        STATES.HELLO,
        STATES.AUTH
    ],

    [TYPES.SERVER]: [
        STATES.SERVER,
        STATES.READY,
        STATES.CONNECTED
    ],

    [TYPES.READY]: [
        STATES.READY
    ],

    [TYPES.CLIENT]: [
        STATES.CONNECTED
    ],

    [TYPES.NICK]: [
        STATES.CONNECTED
    ],

    [TYPES.JOIN]: [
        STATES.CONNECTED
    ],

    [TYPES.PART]: [
        STATES.CONNECTED
    ],

    [TYPES.QUIT]: [
        STATES.CONNECTED
    ],

    [TYPES.MESSAGE]: [
        STATES.CONNECTED
    ],


    [TYPES.NOTICE]: [
        STATES.CONNECTED
    ],

    [TYPES.PING]: [
        STATES.CONNECTED
    ],

    [TYPES.PONG]: [
        STATES.CONNECTED
    ],

    [TYPES.ACK]: [
        STATES.CONNECTED
    ],

    [TYPES.CHANNEL_STATE]: [
    STATES.CONNECTED
],
};

module.exports = {
    ALLOWED_STATES
};