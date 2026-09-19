// src/s2s/manager/manager.js

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
const RouteResolver = require('../network/routing/route-resolver.js');
const acceptEvent = require('./acceptEvent.js');

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
        this.eventRegistry = new EventRegistry();
        this.networkState = new NetworkState(serverId);
        this.routeResolver = new RouteResolver(this);
        this.remoteClients = new RemoteClientRegistry();
        this.getLocalClientByNick = getLocalClientByNick;

        setupEvents(this);
    }

    sendRemoteMessage(clientId, message) {
        return sendRemoteMessage(
            this,
            clientId,
            message
        );
    }

    getClientRoute(clientId) {
        const serverId =
            this.remoteClients.getServerId(
                clientId
            );

        if (!serverId) {
            return null;
        }

        return this.getRoute(serverId);
    }

    getClientNextHop(clientId) {
        const serverId =
            this.remoteClients.getServerId(
                clientId
            );

        if (!serverId) {
            return null;
        }

        return this.getNextHop(serverId);
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