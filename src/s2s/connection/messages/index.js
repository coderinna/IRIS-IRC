// src/s2s/connection/messages/index.js

module.exports = {

    sendHello:
        require('./sendHello.js'),

    sendAuth:
        require('./sendAuth.js'),

    sendServer:
        require('./sendServer.js'),

    sendReady:
        require('./sendReady.js'),

    sendAck:
        require('./sendAck.js'),

    sendMessage:
        require('./sendMessage.js')

};