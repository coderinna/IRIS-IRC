const setupEvents =
    require('./handlers/setupEvents.js');

const RemoteClientRegistry =
    require('./remote-clients.js');


const {
    addConnection,
    removeConnection
} = require('./connections');

const NetworkState =
    require('../network/state');

    const EventRegistry =
    require('../events/registry');

    const validateRemoteEvent =
    require('../messages/validate-event');

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
    if (!validateRemoteEvent(event)) {
        return false;
    }

    if (this.eventRegistry.has(event.eventId)) {
        return false;
    }

    this.eventRegistry.remember(
        event.eventId
    );

    return true;
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
registerRemoteServer(connection) {
    if (!connection?.remote?.serverId) {
        return false;
    }

    const serverId =
        connection.remote.serverId;

    if (serverId === this.serverId) {
        return false;
    }

    this.networkState.addServer({
        serverId,
        serverName:
            connection.remote.serverName,
        local: false,
        connection
    });

    return true;
}

    unregisterRemoteServer(connection) {
        if (
            !this.networkManager ||
            !connection.remote.serverId
        ) {
            return false;
        }

        const server =
            this.networkManager.getServer(
                connection.remote.serverId
            );

        if (!server) {
            return false;
        }

        if (
            server.connection &&
            server.connection !== connection
        ) {
            return false;
        }

        this.networkManager.setConnection(
            connection.remote.serverId,
            null
        );

        this.networkManager.setStatus(
            connection.remote.serverId,
            'offline'
        );

        return true;
    }
}

module.exports = S2SManager;