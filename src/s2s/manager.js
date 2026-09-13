const crypto = require('crypto');

const events = require('../events');

const {
    encodeClient
} = require('./client');

const {
    encodeNick
} = require('./nick');

const {
    encodeJoin
} = require('./join');

const {
    encodePart
} = require('./part');

const {
    encodeQuit
} = require('./quit');

const {
    encodeMessage
} = require('./message');

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

    events.on(
    'channel:joined',
    ({ client, channel }) => {
        this.handleJoin(client, channel);
    }
);

events.on(
    'channel:left',
    ({ client, channel, reason }) => {
        this.handlePart(
            client,
            channel,
            reason
        );
    }
);

events.on(
    'client:quit',
    ({ client, reason }) => {
        this.handleQuit(client, reason);
    }
);

events.on(
    'message:sent',
    ({ client, target, message }) => {
        this.handleMessage(
            client,
            target,
            message
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

    handleJoin(client, channel) {
    if (!client || !client.id || !channel) {
        return;
    }

    console.log(
        `[IRISH] Broadcasting JOIN: ` +
        `${client.nick} → ${channel}`
    );

    for (const connection of this.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodeJoin({
                clientId: client.id,
                channel,
                serverId: this.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → JOIN ` +
                `${client.nick} → ${channel} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] JOIN event failed:',
                error.message
            );
        }
    }
}

handlePart(client, channel, reason = '') {
    if (!client || !client.id || !channel) {
        return;
    }

    console.log(
        `[IRISH] Broadcasting PART: ` +
        `${client.nick} ← ${channel}`
    );

    for (const connection of this.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodePart({
                clientId: client.id,
                channel,
                reason,
                serverId: this.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → PART ` +
                `${client.nick} ← ${channel} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] PART event failed:',
                error.message
            );
        }
    }
}

handleQuit(client, reason = '') {
    if (!client || !client.id) {
        return;
    }

    console.log(
        `[IRISH] Broadcasting QUIT: ` +
        `${client.nick}`
    );

    for (const connection of this.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodeQuit({
                clientId: client.id,
                reason,
                serverId: this.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → QUIT ` +
                `${client.nick} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] QUIT event failed:',
                error.message
            );
        }
    }
}

handleMessage(client, target, message) {
    if (!client || !client.id) {
        return;
    }

    if (!target || !message) {
        return;
    }

    console.log(
        `[IRISH] Broadcasting MESSAGE: ` +
        `${client.nick} → ${target}`
    );

    for (const connection of this.connections) {
        if (connection.state !== 'connected') {
            continue;
        }

        try {
            const messageId =
                crypto.randomBytes(16);

            const frame = encodeMessage({
                clientId: client.id,
                target,
                message,
                serverId: this.serverId
            }, messageId);

            connection.sendFrame(frame);

            console.log(
                `[IRISH] → MESSAGE ` +
                `${client.nick} → ${target} ` +
                `via ${connection.remote.serverId}`
            );

        } catch (error) {
            console.error(
                '[IRISH] MESSAGE event failed:',
                error.message
            );
        }
    }
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