const crypto = require('crypto');

const events = require('../events');

const {
    encodeClient
} = require('./client');

const {
    encodeNick
} = require('./nick');

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

    events.on(
        'client:nick_changed',
        ({ client, oldNick, newNick }) => {
            this.handleNickChanged(
                client,
                oldNick,
                newNick
            );
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

    handleNickChanged(client, oldNick, newNick) {
    if (!client || !client.id) {
        return;
    }

    if (!oldNick || !newNick) {
        return;
    }

    console.log(
        `[IRISH] Broadcasting NICK: ` +
        `${oldNick} → ${newNick}`
    );

    for (const connection of this.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodeNick({
                clientId: client.id,
                oldNick,
                newNick,
                serverId: this.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → NICK ` +
                `${oldNick} → ${newNick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] NICK event failed:',
                error.message
            );
        }
    }
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