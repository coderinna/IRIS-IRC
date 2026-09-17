const {
    addServer,
    removeServer,
    getServer,
    getServers,
    setStatus,
    setConnection
} = require('./network/index.js');

const {
    addClient,
    removeClient,
    getClient,
    getClients,
    updateClient,
    removeClientsByConnection
} = require('./clients');

const {
    addChannel,
    removeChannel,
    getChannel,
    getChannels,
    addClient: addClientToChannel,
    removeClient: removeClientFromChannel
} = require('../../channel/index.js');

class NetworkManager {
    constructor() {
        this.servers = new Map();
        this.clients = new Map();
        this.channels = new Map();
    }

    /*
     * Servers
     */

    addServer(server) {
        return addServer(
            this,
            server
        );
    }

    removeServer(serverId) {
        return removeServer(
            this,
            serverId
        );
    }

    getServer(serverId) {
        return getServer(
            this,
            serverId
        );
    }

    getServers() {
        return getServers(this);
    }

    setStatus(serverId, status) {
        return setStatus(
            this,
            serverId,
            status
        );
    }

    setConnection(
        serverId,
        connection
    ) {
        return setConnection(
            this,
            serverId,
            connection
        );
    }

    getStatus(serverId) {
        const server =
            getServer(
                this,
                serverId
            );

        if (!server) {
            return null;
        }

        return server.status;
    }

    /*
     * Remote clients
     */

    addClient(client) {
        return addClient(
            this,
            client
        );
    }

    removeClient(
        serverId,
        clientId
    ) {
        return removeClient(
            this,
            serverId,
            clientId
        );
    }

    getClient(
        serverId,
        clientId
    ) {
        return getClient(
            this,
            serverId,
            clientId
        );
    }

    getClients() {
        return getClients(this);
    }

    updateClient(
        serverId,
        clientId,
        updates
    ) {
        return updateClient(
            this,
            serverId,
            clientId,
            updates
        );
    }

    removeClientsByConnection(
        connection
    ) {
        return removeClientsByConnection(
            this,
            connection
        );
    }

    /*
     * Remote channels
     */

    addChannel(channel) {
        return addChannel(
            this,
            channel
        );
    }

    removeChannel(name) {
        return removeChannel(
            this,
            name
        );
    }

    getChannel(name) {
        return getChannel(
            this,
            name
        );
    }

    getChannels() {
        return getChannels(this);
    }

    addClientToChannel(
        channelName,
        client
    ) {
        return addClientToChannel(
            this,
            channelName,
            client
        );
    }

    removeClientFromChannel(
        channelName,
        client
    ) {
        return removeClientFromChannel(
            this,
            channelName,
            client
        );
    }
}

module.exports = NetworkManager;