
const crypto = require('crypto');

const {
    decodeMode,
    encodeMode
} = require('../../messages/mode');

module.exports = function handleMode(connection, frame) {
    try {
        const mode = decodeMode(frame.payload);

        if (!connection.manager?.networkManager) {
            throw new Error('Network manager is not available');
        }

        const networkManager =
            connection.manager.networkManager;

        const client = networkManager.getClient(
            mode.serverId,
            mode.clientId
        );

        if (!client) {
            throw new Error(
                `Unknown remote client: ${mode.clientId}`
            );
        }

        if (client.serverId !== mode.serverId) {
            throw new Error('MODE client server identity mismatch');
        }

        if (client.connection !== connection) {
            throw new Error(
                'Remote client does not belong to this connection'
            );
        }

        const channel = networkManager.getChannel(mode.channel);

        if (!channel || !channel.clients.has(client)) {
            throw new Error(
                `Client is not a member of channel: ${mode.channel}`
            );
        }

        if (!channel.isOperator(client)) {
            throw new Error(
                `Client ${client.nick} is not a channel operator: ${mode.channel}`
            );
        }

        const adding = mode.mode.startsWith('+');
        const removing = mode.mode.startsWith('-');
        const modeLetter = mode.mode.slice(1);
        const modeParam = mode.modeParam || '';

        if (!adding && !removing) {
            throw new Error(`Invalid MODE: ${mode.mode}`);
        }

        if (modeLetter === 'i') {
            if (adding) {
                channel.addMode('i');
            } else {
                channel.removeMode('i');
            }

        } else if (modeLetter === 'k') {
            if (adding) {
                if (!modeParam) {
                    throw new Error('Missing channel key');
                }

                channel.setKey(modeParam);
                channel.addMode('k');
            } else {
                channel.setKey(null);
                channel.removeMode('k');
            }

        } else if (modeLetter === 'l') {
            if (adding) {
                if (!modeParam || !channel.setLimit(modeParam)) {
                    throw new Error('Invalid channel limit');
                }

                channel.addMode('l');
            } else {
                channel.removeLimit();
                channel.removeMode('l');
            }

        } else if (modeLetter === 'o') {
            const targetClient = [...channel.clients].find(
                member =>
                    member.nick.toLowerCase() ===
                    (mode.targetNick || '').toLowerCase()
            );

            if (!targetClient) {
                throw new Error(
                    `Unknown MODE target: ${mode.targetNick}`
                );
            }

            if (adding) {
                channel.addOperator(targetClient);
            } else {
                channel.removeOperator(targetClient);
            }

        } else {
            throw new Error(`Unsupported MODE: ${mode.mode}`);
        }

        // Notify local clients
        const localChannel = connection.manager
            .getLocalChannels()
            .find(channel => channel.name === mode.channel);

        if (localChannel) {
            let target = '';

            if (modeLetter === 'o') {
                target = ` ${mode.targetNick}`;
            } else if (
                adding &&
                (modeLetter === 'k' || modeLetter === 'l')
            ) {
                target = ` ${modeParam}`;
            }

            const message =
                `:${client.nick}!${client.user || '*'}@${client.host || 'localhost'} MODE ${mode.channel} ${mode.mode}${target}`;

            for (const localClient of localChannel.getMembers()) {
                localClient.send(message);
            }
        }

        console.log(
            `[IRIS] ← MODE ${mode.channel} ${mode.mode} ` +
            `${mode.targetNick || modeParam || ''}`
        );

        // Forward MODE to other connected servers
        for (const nextConnection of connection.manager.connections) {
            if (
                nextConnection === connection ||
                nextConnection.state !== 'connected'
            ) {
                continue;
            }

            try {
                const messageId =
                    frame.messageId || crypto.randomBytes(16);

                const sequence =
                    nextConnection.nextSendSequence();

                const nextFrame = encodeMode(
                    mode,
                    messageId,
                    sequence
                );

                nextConnection.sendTrackedFrame(
                    nextFrame,
                    messageId
                );

            } catch (error) {
                console.error(
                    '[IRIS] MODE propagation failed:',
                    error.message
                );
            }
        }

        return true;

    } catch (error) {
        console.error('[IRIS] Invalid MODE:', error.message);

        if (connection?.socket) {
            connection.socket.destroy();
        }

        return false;
    }
};
