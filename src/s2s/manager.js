const crypto = require('crypto');

const events = require('../events');

const {
    encodeClient
} = require('./client');

class S2SManager {
    constructor({
        serverId,
        serverName
    }) {
        this.serverId = serverId;
        this.serverName = serverName;

        this.connections = new Set();

        this.setupEvents();
    }

    setupEvents() {
        events.on(
            'client:registered',
            ({ client }) => {
                this.handleClientRegistered(client);
            }
        );
    }

    addConnection(connection) {
        this.connections.add(connection);

        console.log(
            `[IRISH] Connection added: ` +
            `${connection.remote.serverId || 'unknown'}`
        );
    }

    removeConnection(connection) {
        this.connections.delete(connection);
    }

    handleClientRegistered(client) {
        if (!client || !client.nick) {
            return;
        }

        console.log(
            `[IRISH] Broadcasting CLIENT: ${client.nick}`
        );

        for (const connection of this.connections) {
            if (connection.state !== 'connected') {
                continue;
            }

            try {
                const messageId =
                    crypto.randomBytes(16);

                const frame = encodeClient({
                    clientId: client.id,
                    nick: client.nick,
                    user: client.user || '',
                    host: 'localhost',
                    serverId: this.serverId
                }, messageId);

                connection.sendFrame(frame);

                console.log(
                    `[IRISH] → CLIENT ` +
                    `${client.nick} ` +
                    `via ${connection.remote.serverId}`
                );
            } catch (error) {
                console.error(
                    '[IRISH] CLIENT event failed:',
                    error.message
                );
            }
        }
    }
}

module.exports = S2SManager;