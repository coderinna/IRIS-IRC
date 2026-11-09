
// src/commands/mode.js

const events = require('../events');

function handleMode(client, params, getChannel, serverName) {
    const target = params[0];

    if (!target) {
        return;
    }

    // User MODE
    if (!target.startsWith('#')) {
        if (target.toLowerCase() !== client.nick.toLowerCase()) {
            client.send(
                `:${serverName} 502 ${client.nick} :Cannot change mode for other users`
            );
            return;
        }

        client.send(
            `:${serverName} 221 ${client.nick} +${client.modes ? [...client.modes].join('') : ''}`
        );

        return;
    }

    const channel = getChannel(target);

    if (!channel) {
        client.send(
            `:${serverName} 403 ${client.nick} ${target} :No such channel`
        );
        return;
    }

    const modeString = params[1];

    if (!modeString) {
        client.send(
            `:${serverName} 324 ${client.nick} ${channel.name} +${channel.getModes().join('')}`
        );
        return;
    }

    if (!channel.isOperator(client)) {
        client.send(
            `:${serverName} 482 ${client.nick} ${channel.name} :You're not channel operator`
        );
        return;
    }

    const adding = modeString.startsWith('+');
    const removing = modeString.startsWith('-');
    const mode = modeString.slice(1);

    if (!adding && !removing) {
        return;
    }

    let modeParam = '';
    let targetClient = null;

    // +i / -i
    if (mode === 'i') {
        if (adding) {
            channel.addMode('i');
        } else {
            channel.removeMode('i');
        }
    }

    // +k / -k
    else if (mode === 'k') {
        modeParam = params[2] || '';

        if (adding) {
            if (!modeParam) {
                client.send(
                    `:${serverName} 461 ${client.nick} MODE :Not enough parameters`
                );
                return;
            }

            channel.setKey(modeParam);
            channel.addMode('k');
        } else {
            channel.setKey(null);
            channel.removeMode('k');
            modeParam = '';
        }
    }

    // +l / -l
    else if (mode === 'l') {
        if (adding) {
            modeParam = params[2] || '';

            if (!channel.setLimit(modeParam)) {
                client.send(
                    `:${serverName} 461 ${client.nick} MODE :Invalid or missing channel limit`
                );
                return;
            }

            channel.addMode('l');
        } else {
            channel.removeLimit();
            channel.removeMode('l');
        }
    }

    // +o / -o
    else if (mode === 'o' || mode === 'v') {
        const targetNick = params[2];

        if (!targetNick) {
            client.send(
                `:${serverName} 461 ${client.nick} MODE :Not enough parameters`
            );
            return;
        }

        targetClient = [...channel.clients].find(
            member =>
                member.nick.toLowerCase() === targetNick.toLowerCase()
        );

        if (!targetClient) {
            client.send(
                `:${serverName} 401 ${client.nick} ${targetNick} :No such nick`
            );
            return;
        }

        if (mode === 'o') {
            if (adding) {
                channel.addOperator(targetClient);
            } else {
                channel.removeOperator(targetClient);
            }
        } else {
            if (adding) {
                channel.addVoice(targetClient);
            } else {
                channel.removeVoice(targetClient);
            }
        }

        modeParam = targetClient.nick;
    }

    // Unsupported channel mode
    else {
        client.send(
            `:${serverName} 472 ${client.nick} ${mode} :is unknown mode char to me`
        );
        return;
    }

    const modeMessage = modeParam
        ? `:${client.nick} MODE ${channel.name} ${modeString} ${modeParam}`
        : `:${client.nick} MODE ${channel.name} ${modeString}`;

    channel.broadcast(modeMessage);

    events.emit('channel:mode', {
        client,
        channel,
        mode: modeString,
        targetNick: ['o', 'v'].includes(mode) ? modeParam : '',
        modeParam
    });
}

module.exports = handleMode;