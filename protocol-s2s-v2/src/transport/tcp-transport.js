
'use strict';

const net = require('node:net');
const { EventEmitter } = require('node:events');

const listen = require('./operations/listen.js');
const attachSocket = require('./operations/attachSocket.js');
const handleData = require('./operations/handleData.js');
const send = require('./operations/send.js');
const connect = require('./operations/connect.js');
const close = require('./operations/close.js');

const HEADER_SIZE = 4;
const MAX_MESSAGE_SIZE = 1024 * 1024;

class TcpTransport extends EventEmitter {
    constructor(options = {}) {
        super();

        this.host = options.host || '127.0.0.1';
        this.port = options.port || 0;
        this.server = null;
        this.sockets = new Set();
        this.buffer = new WeakMap();
    }

listen() {
    return listen(
        this.port,
        this.host,
        socket => this.attachSocket(socket),
        (event, address) => this.emit(event, address),
        server => { this.server = server; },
        port => { this.port = port; }
    );
}

attachSocket(socket) {
    attachSocket(
        socket,
        this.sockets,
        this.buffer,
        (socket, chunk) => this.handleData(socket, chunk),
        (event, ...args) => this.emit(event, ...args)
    );
}

handleData(socket, chunk) {
    handleData(
        socket,
        chunk,
        this.buffer,
        HEADER_SIZE,
        MAX_MESSAGE_SIZE,
        (event, ...args) => this.emit(event, ...args)
    );
}

send(socket, message) {
    return send(
        socket,
        message,
        HEADER_SIZE,
        MAX_MESSAGE_SIZE
    );
}

connect(port, host = this.host) {
    return connect(
        port,
        host,
        socket => this.attachSocket(socket)
    );
}

 close() {
    return close(this.sockets, this.server);
}
}

module.exports = TcpTransport;
