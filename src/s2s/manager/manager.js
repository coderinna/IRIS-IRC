const events = require('../../events');

const handleClient = require('./handlers/client');
const handleNick = require('./handlers/nick');
const handleJoin = require('./handlers/join');
const handlePart = require('./handlers/part');
const handleQuit = require('./handlers/quit');
const handleMessage = require('./handlers/message');

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
                handleClient(
                    this,
                    client
                );
            }
        );

        events.on(
            'client:nick_changed',
            ({ client, oldNick, newNick }) => {
                handleNick(
                    this,
                    client,
                    oldNick,
                    newNick
                );
            }
        );

        events.on(
            'channel:joined',
            ({ client, channel }) => {
                handleJoin(
                    this,
                    client,
                    channel
                );
            }
        );

        events.on(
            'channel:left',
            ({ client, channel, reason }) => {
                handlePart(
                    this,
                    client,
                    channel,
                    reason
                );
            }
        );

        events.on(
            'client:quit',
            ({ client, reason }) => {
                handleQuit(
                    this,
                    client,
                    reason
                );
            }
        );

        events.on(
            'message:sent',
            ({ client, target, message }) => {
                handleMessage(
                    this,
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

    removeConnection(connection) {
        this.connections.delete(connection);
    }
}

module.exports = S2SManager;