const setupEvents =
    require('./handlers/setupEvents.js');

const RemoteClientRegistry =
    require('./remote-clients.js');


const {
    addConnection,
    removeConnection
} = require('./connections');

class S2SManager {
    constructor({
        serverId,
        serverName,
        networkManager
    }) {
        this.serverId = serverId;
        this.serverName = serverName;
        this.networkManager = networkManager;

        this.connections = new Set();

        this.remoteClients =
    new RemoteClientRegistry();

        setupEvents(this);
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
    if (
        !this.networkManager ||
        !connection.remote.serverId
    ) {
        return false;
    }

    const serverId =
        connection.remote.serverId;

    let server =
        this.networkManager.getServer(
            serverId
        );

    if (!server) {
        server =
            this.networkManager.addServer({
                serverId,
                serverName:
                    connection.remote.serverName ||
                    serverId,
                role:
                    connection.remote.serverRole ||
                    'server'
            });
    }

    this.networkManager.setConnection(
        serverId,
        connection
    );

    this.networkManager.setStatus(
        serverId,
        'online'
    );

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