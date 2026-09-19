// src/s2s/listener/server.js

const net = require('node:net');

const {
    S2SConnection
} = require('../connection/connection');

class S2SListener {
    constructor({
        host = '0.0.0.0',
        port = 7000,
        serverId,
        serverName,
        serverVersion,
        serverRole,
        capabilities,
        authToken,
        manager
    }) {
        this.host = host;
        this.port = port;

this.connectionOptions = {
    serverId,
    serverName,
    serverVersion,
    serverRole,
    capabilities,
    authToken,
    manager,
    networkManager: manager?.networkManager
};
        this.manager = manager;
        this.server = null;
    }

    start() {
        if (this.server) {
            throw new Error(
                'S2S listener is already running'
            );
        }

        this.server =
            net.createServer(
                socket => {
                    this.handleConnection(socket);
                }
            );

        this.server.on(
            'error',
            error => {
                console.error(
                    `[S2S] Listener error: ${error.message}`
                );
            }
        );

        this.server.listen(
            this.port,
            this.host,
            () => {
                console.log(
                    `[S2S] Listening on ` +
                    `${this.host}:${this.port}`
                );
            }
        );
    }

    handleConnection(socket) {
        console.log(
            `[S2S] Incoming connection from ` +
            `${socket.remoteAddress}:${socket.remotePort}`
        );

        socket.setNoDelay(true);

        const connection =
            new S2SConnection(
                socket,
                this.connectionOptions
            );

        if (this.manager) {
            this.manager.addConnection(
                connection
            );
        }

        connection.start();
    }

    stop() {
        if (!this.server) {
            return;
        }

        this.server.close();

        this.server = null;

        console.log(
            '[S2S] Listener stopped'
        );
    }
}

module.exports = S2SListener;