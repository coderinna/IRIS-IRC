
'use strict';

const net = require('node:net');
const { EventEmitter } = require('node:events');

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
        return new Promise((resolve, reject) => {
            this.server = net.createServer(socket => {
                this.attachSocket(socket);
            });

            this.server.once('error', reject);

            this.server.listen(this.port, this.host, () => {
                this.server.removeListener('error', reject);

                const address = this.server.address();
                this.port = address.port;

                resolve(address);
                this.emit('listening', address);
            });
        });
    }

    attachSocket(socket) {
        this.sockets.add(socket);
        this.buffer.set(socket, Buffer.alloc(0));

        socket.on('data', chunk => {
            this.handleData(socket, chunk);
        });

        socket.on('close', () => {
            this.sockets.delete(socket);
            this.buffer.delete(socket);
            this.emit('disconnect', socket);
        });

        socket.on('error', error => {
            this.emit('socketError', error);
        });

        this.emit('connection', socket);
    }

    handleData(socket, chunk) {
        let buffer = Buffer.concat([
            this.buffer.get(socket) || Buffer.alloc(0),
            chunk
        ]);

        while (buffer.length >= HEADER_SIZE) {
            const messageLength = buffer.readUInt32BE(0);

            if (
                messageLength < 1 ||
                messageLength > MAX_MESSAGE_SIZE
            ) {
                socket.destroy(new Error('Invalid message length'));
                return;
            }

            const frameLength = HEADER_SIZE + messageLength;

            if (buffer.length < frameLength) {
                break;
            }

            const payload = buffer.subarray(
                HEADER_SIZE,
                frameLength
            );

            try {
                const message = JSON.parse(payload.toString('utf8'));
                this.emit('message', message, socket);
            } catch (error) {
                this.emit('protocolError', error, socket);
                socket.destroy();
                return;
            }

            buffer = buffer.subarray(frameLength);
        }

        this.buffer.set(socket, buffer);
    }

    send(socket, message) {
        if (!socket || socket.destroyed) {
            throw new Error('Socket is not connected');
        }

        const payload = Buffer.from(JSON.stringify(message));

        if (
            payload.length < 1 ||
            payload.length > MAX_MESSAGE_SIZE
        ) {
            throw new Error('Message size out of range');
        }

        const header = Buffer.alloc(HEADER_SIZE);
        header.writeUInt32BE(payload.length, 0);

        socket.write(Buffer.concat([header, payload]));
    }

    connect(port, host = this.host) {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection({ port, host });

            const onError = error => {
                socket.destroy();
                reject(error);
            };

            socket.once('error', onError);

            socket.once('connect', () => {
                socket.removeListener('error', onError);
                this.attachSocket(socket);
                resolve(socket);
            });
        });
    }

    close() {
        for (const socket of this.sockets) {
            socket.destroy();
        }

        this.sockets.clear();

        if (!this.server) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.server.close(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = TcpTransport;
