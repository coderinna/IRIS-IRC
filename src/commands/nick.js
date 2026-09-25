// src/commands/nick.js

const events = require('../events');

function isValidNick(nick) {
    if (!nick) {
        return false;
    }

    // IRIS:n ensimmäinen versio:
    // kirjain + kirjaimia, numeroita, _ tai -
    return /^[A-Za-z][A-Za-z0-9_-]{0,15}$/.test(nick);
}

function handleNick(
    client,
    nick,
    registerClient,
    getClientByNick,
    networkManager
) {
    if (!nick) {
        client.send(
            `:irc.iris.local 431 ${client.nick || '*'} :No nickname given`
        );
        return;
    }

    if (!isValidNick(nick)) {
        client.send(
            `:irc.iris.local 432 ${client.nick || '*'} ${nick} :Erroneous nickname`
        );
        return;
    }

const existing =
    getClientByNick(nick);

const networkExisting =
    networkManager?.getClients()
        .find(
            networkClient =>
                networkClient.nick &&
                networkClient.nick.toLowerCase() ===
                nick.toLowerCase()
        );

if (
    (existing && existing !== client) ||
    networkExisting
) {
    client.send(
        `:irc.iris.local 433 ${client.nick || '*'} ${nick} :Nickname is already in use`
    );
    return;
}

    // Ensimmäinen nick
    if (!client.nick) {
        client.nick = nick;

        registerClient(client);

        return;
    }

    // Ei muutosta
    if (client.nick === nick) {
        return;
    }

    const oldNick = client.nick;

    const message =
        `:${oldNick}!${client.user}@localhost NICK :${nick}`;

    client.nick = nick;

    events.emit('client:nick_changed', {
        client,
        oldNick,
        newNick: nick
    });

    // Ilmoitetaan kaikille yhteisillä kanavilla
    const notified = new Set();

    for (const channel of client.channels) {
        for (const member of channel.clients) {
            if (!notified.has(member)) {
                member.send(message);
                notified.add(member);
            }
        }
    }

    // Jos ei ole kanavilla, ilmoitetaan itselle
    if (notified.size === 0) {
        client.send(message);
    }

    console.log(
        `[${client.id}] Nick changed: ${oldNick} -> ${nick}`
    );
}

module.exports = handleNick;