// src/s2s/manager/handlers/setupEvents.js

const events = require('../../../events');

const handleMode = require('./mode');
const handleClient = require('./client');
const handleNick = require('./nick');
const handleJoin = require('./join');
const handlePart = require('./part');
const handleQuit = require('./quit');
const handleMessage = require('./message');
const handleTopic = require('./topic');
const handleNotice = require('./notice');

module.exports = function setupEvents(connection) {
    const manager = connection;

    events.on(
        'client:registered',
        ({ client }) => {
            handleClient(manager, client);
        }
    );

    events.on(
        'client:nick_changed',
        ({ client, oldNick, newNick }) => {
            handleNick(
                manager,
                client,
                oldNick,
                newNick
            );
        }
    );

    events.on(
        'channel:joined',
        ({ client, channel }) => {
            handleJoin(manager, client, channel);
        }
    );

    events.on(
        'channel:parted',
        ({ client, channel, reason }) => {
            handlePart(
                manager,
                client,
                channel,
                reason
            );
        }
    );

    events.on(
        'client:quit',
        ({ client, reason }) => {
            handleQuit(manager, client, reason);

            const serverId = manager.serverId;
            const clientId = client?.id;

            if (!serverId || !clientId) {
                return;
            }

            const networkManager =
                manager.networkManager;

            const remoteClient =
                networkManager.getClient(
                    serverId,
                    clientId
                );

            if (remoteClient) {
                for (const [channelName, channel] of networkManager.channels) {
                    if (channel.clients.has(remoteClient)) {
                        networkManager.removeClientFromChannel(
                            channelName,
                            remoteClient
                        );
                    }
                }
            }

            networkManager.removeClient(
                serverId,
                clientId
            );

            manager.remoteClients.remove(
                serverId,
                clientId
            );
        }
    );

    events.on(
        'message:sent',
        ({ client, target, message, type }) => {
            if (type === 'notice') {
                handleNotice(
                    manager,
                    client,
                    target,
                    message
                );
                return;
            }

            handleMessage(
                manager,
                client,
                target,
                message
            );
        }
    );

    events.on(
        'channel:mode',
        ({ client, channel, mode, targetNick, modeParam }) => {
            handleMode(
                manager,
                client,
                channel,
                mode,
                targetNick,
                modeParam
            );
        }
    );

    events.on(
        'channel:topic',
        ({ client, channel, topic }) => {
            handleTopic(
                manager,
                client,
                channel,
                topic
            );
        }
    );
};