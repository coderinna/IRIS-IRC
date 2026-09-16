const setupEvents =
    require('./handlers/setupEvents.js');

const {
    addConnection,
    removeConnection
} = require('./connections');

class S2SManager {
    constructor({
        serverId,
        serverName
    }) {
        this.serverId = serverId;
        this.serverName = serverName;

        this.connections = new Set();

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
}

module.exports = S2SManager;