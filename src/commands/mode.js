// src/commands/mode.js

const events = require('../events');

function handleMode(client, params, server) {
    const target = params[0];

    if (!target) {
        return;
    }

    // User MODE
    if (!target.startsWith('#')) {
        if (target.toLowerCase() !== client.nick.toLowerCase()) {
            server.sendNumeric(client, 502, ':Cannot change mode for other users');
            return;
        }

        server.sendNumeric(
            client,
            221,
            `+${client.modes ? [...client.modes].join('') : ''}`
        );

        return;
    }

    // Channel lookup
    const channel = server.channels.get(target);

    if (!channel) {
        server.sendNumeric(client, 403, `${target} :No such channel`);
        return;
    }

    const modeString = params[1];

    // Channel MODE query
    if (!modeString) {
        server.sendNumeric(
            client,
            324,
            `${channel.name} +${channel.getModes().join('')}`
        );

        return;
    }

    // Channel modes require operator privileges
    if (!channel.isOperator(client)) {
        server.sendNumeric(client, 482, `${channel.name} :You're not channel operator`);
        return;
    }

    const adding = modeString.startsWith('+');
    const removing = modeString.startsWith('-');
    const mode = modeString.slice(1);

    if (!adding && !removing) {
        return;
    }

    // +i / -i: Invite-only channel mode
    if (mode === 'i') {
        if (adding) {
            channel.addMode('i');
        } else {
            channel.removeMode('i');
        }

        server.broadcastToChannel(
            channel,
            `:${client.nick} MODE ${channel.name} ${modeString}`
        );

        events.emit('channel:mode', {
            client,
            channel,
            mode: modeString,
            targetNick: ''
        });

        return;
    }

    // +o / -o: Channel operator privileges
    if (mode === 'o') {
        const targetNick = params[2];

        if (!targetNick) {
            return;
        }

        const targetClient = [...channel.clients].find(
            member => member.nick.toLowerCase() === targetNick.toLowerCase()
        );

        if (!targetClient) {
            server.sendNumeric(client, 401, `${targetNick} :No such nick`);
            return;
        }

        if (adding) {
            channel.addOperator(targetClient);
        } else {
            channel.removeOperator(targetClient);
        }

        server.broadcastToChannel(
            channel,
            `:${client.nick} MODE ${channel.name} ${modeString} ${targetClient.nick}`
        );

        events.emit('channel:mode', {
            client,
            channel,
            mode: modeString,
            targetNick: targetClient.nick
        });

        return;
    }
}

module.exports = handleMode;