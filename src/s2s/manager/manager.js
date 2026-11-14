// src/s2s/manager/manager.js
const {
    TrustRegistry,
    createNetworkPolicy,
    createServerPolicy
} = require('../security');
const setupEvents = require('./handlers/setupEvents.js');
const RemoteClientRegistry = require('./remote-clients/remote-clients.js');
const { sendRemoteMessage } = require('./routing');
const { addConnection, removeConnection } = require('./connections/index.js');

const {
    registerRemoteServer,
    unregisterRemoteServer,
    registerIntroducedServer,
    propagateServer,
} = require('./server/index.js');

const NetworkState = require('../network/state.js');
const EventRegistry = require('../events/registry.js');
const RouteResolver = require('../network/routing/index.js');
const acceptEvent = require('./acceptEvent.js');

class S2SManager {
constructor({
    serverId,
    serverName,
    networkManager,
    getLocalClientByNick,
    getLocalClientById,
    getLocalChannels,
    trustRegistry,
    networkPolicy = {},
    serverPolicy = {}
}) {
        this.serverId = serverId;
        this.serverName = serverName;
        this.networkManager = networkManager;
        this.connections = new Set();
        this.eventRegistry = new EventRegistry();
        this.networkState = new NetworkState(serverId);
        this.routeResolver = new RouteResolver(this);
        this.remoteClients = new RemoteClientRegistry();
     this.getLocalClientByNick = getLocalClientByNick;
this.getLocalClientById = getLocalClientById;
this.getLocalChannels = getLocalChannels;
this.trustRegistry =
    trustRegistry || new TrustRegistry();

this.networkPolicy =
    createNetworkPolicy(networkPolicy);

this.serverPolicy =
    createServerPolicy(serverPolicy);

        setupEvents(this);
    }

sendRemoteMessage(
    serverId,
    clientId,
    message
) {
    return sendRemoteMessage(
        this,
        serverId,
        clientId,
        message
    );
}

getClientRoute(serverId, clientId) {
    const client =
        this.remoteClients.get(
            serverId,
            clientId
        );

    if (!client) {
        return null;
    }

    return this.getRoute(
        client.serverId
    );
}

getClientNextHop(serverId, clientId) {
    const client =
        this.remoteClients.get(
            serverId,
            clientId
        );

    if (!client) {
        return null;
    }

    return this.getNextHop(
        client.serverId
    );
}

    getRoute(serverId) {
        return this.routeResolver.getRoute(
            serverId
        );
    }

    getNextHop(serverId) {
        return this.routeResolver.getNextHop(
            serverId
        );
    }

    getNextClientConnection(
        serverId,
        sourceConnection
    ) {
        const route =
            this.getRoute(serverId);

        if (!route) {
            return null;
        }

        if (route === sourceConnection) {
            return null;
        }

        if (route.state !== 'connected') {
            return null;
        }

        return route;
    }

    acceptEvent(event) {
        return acceptEvent(this, event);
    }

    getNetworkState() {
        return this.networkState;
    }

    isLocalClient(client) {
        return client?.isOwnedBy(
            this.serverId
        ) === true;
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