// src/s2s/listener/server.js

const net = require('node:net');

const {
    S2SConnection
} = require('../connection/connection');

const start =
    require('./lifecycle/start');

    const stop =
    require('./lifecycle/stop');

const handleConnection =
    require('./lifecycle/handle-connection');

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
    return start(this);
}

handleConnection(socket) {
    return handleConnection(
        this,
        socket
    );
}

stop() {
    return stop(this);
}
}

module.exports = S2SListener;