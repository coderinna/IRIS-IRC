
 // src/commands/mode.js

const events = require('../events');

const modeHandlers = {
    i: require('./mode/i.js'),
    k: require('./mode/k.js'),
    l: require('./mode/l.js'),
    m: require('./mode/m.js'),
    n: require('./mode/n.js'),
    o: require('./mode/o.js'),
    t: require('./mode/t.js'),
    v: require('./mode/v.js')
};

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

    const handler = modeHandlers[mode];

    if (!handler) {
        client.send(
            `:${serverName} 472 ${client.nick} ${mode} :is unknown mode char to me`
        );
        return;
    }

    let modeParam = '';
    let targetClient = null;

    // Modes requiring a parameter
    if (mode === 'k' && adding) {
        modeParam = params[2] || '';

        if (!modeParam) {
            client.send(
                `:${serverName} 461 ${client.nick} MODE :Not enough parameters`
            );
            return;
        }
    }

    if (mode === 'l' && adding) {
        modeParam = params[2] || '';

        if (!modeParam) {
            client.send(
                `:${serverName} 461 ${client.nick} MODE :Not enough parameters`
            );
            return;
        }
    }

    if (mode === 'o' || mode === 'v') {
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

        modeParam = targetClient.nick;
    }

    const result = handler(
        channel,
        adding,
        modeParam,
        targetClient
    );

    if (!result) {
        client.send(
            `:${serverName} 461 ${client.nick} MODE :Invalid or missing mode parameter`
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
