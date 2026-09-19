// src/s2s/manager/manager.js

const setupEvents =
    require('./handlers/setupEvents.js');

const RemoteClientRegistry =
    require('./remote-clients/remote-clients.js');


const {
    addConnection,
    removeConnection,
} = require('./connections');


const {
    registerRemoteServer,
    unregisterRemoteServer,
    registerIntroducedServer,
    propagateServer
} = require('./server');


const NetworkState =
    require('../network/state');

    const EventRegistry =
    require('../events/registry');

const acceptEvent =
    require('./acceptEvent.js');

class S2SManager {
constructor({
    serverId,
    serverName,
    networkManager,
    getLocalClientByNick
}) {
        this.serverId = serverId;
        this.serverName = serverName;
        this.networkManager = networkManager;

        this.connections = new Set();

        this.eventRegistry =
    new EventRegistry();

this.networkState =
    new NetworkState(serverId);

        this.remoteClients =
    new RemoteClientRegistry();

    this.getLocalClientByNick =
    getLocalClientByNick;

        setupEvents(this);
    }

acceptEvent(event) {
    return acceptEvent(
        this,
        event
    );
}

    getNetworkState() {
    return this.networkState;
}

    isLocalClient(client) {
    return client?.isOwnedBy(this.serverId) === true;
}

    addConnection(connection) {
        addConnection(
            this,
            connection
        );
    }

    removeConnection(connection) {
        removeConnection(
            this,
            connection
        );
    }
    propagateServer(
    server,
    excludeConnection = null
) {
    return propagateServer(
        this,
        server,
        excludeConnection
    );
}

registerIntroducedServer(
    connection,
    server
) {
    return registerIntroducedServer(
        this,
        connection,
        server
    );
}

registerRemoteServer(connection) {
    return registerRemoteServer(
        this,
        connection
    );
}

unregisterRemoteServer(connection) {
    return unregisterRemoteServer(
        this,
        connection
    );
}
}

module.exports = S2SManager;