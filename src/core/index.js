// src/core/index.js

const Channel = require('../channel');
const events = require('../events');

class Core {
    constructor(serverName) {
        this.serverName = serverName;

        this.clients = new Set();
        this.channels = new Map();
    }

    getOrCreateChannel(name) {
        if (!this.channels.has(name)) {
            this.channels.set(name, new Channel(name));
        }

        return this.channels.get(name);
    }

    getChannel(name) {
        return this.channels.get(name) || null;
    }

    getChannels() {
        return [...this.channels.values()];
    }

    deleteChannel(name) {
        return this.channels.delete(name);
    }

    addClient(client) {
        this.clients.add(client);
    }

    removeClient(client) {
        this.clients.delete(client);
    }

    registerClient(client) {
        if (!client.register()) {
            return false;
        }

        this.addClient(client);

        client.send(
            `:${this.serverName} 001 ${client.nick} :Welcome to Iris IRC`
        );

        client.send(
            `:${this.serverName} 002 ${client.nick} :Your host is ${this.serverName}`
        );

        client.send(
            `:${this.serverName} 003 ${client.nick} :This server was created today`
        );

        client.send(
            `:${this.serverName} 004 ${client.nick} ${this.serverName} iris-irc 0`
        );
/* ovat vain tämän Core-instanssin paikalliset määrät.:
const userCount = this.clients.size;
const channelCount = this.channels.size;
// Jos IRIS-verkossa on myöhemmin IRIS-01, IRIS-02, IRIS-03,
//  nämä eivät vielä kerro koko verkon käyttäjä- ja kanavamääriä.
myöhemmin vaihdetaan nuo networkManager-pohjaisiksi.!!!!!!!
*/
        const userCount = this.clients.size;
const channelCount = this.channels.size;

client.send(
    `:${this.serverName} 251 ${client.nick} :There are ${userCount} users and 0 invisible on 1 server`
);

client.send(
    `:${this.serverName} 252 ${client.nick} 0 :IRC operators online`
);

client.send(
    `:${this.serverName} 253 ${client.nick} 0 :unknown connection(s)`
);

client.send(
    `:${this.serverName} 254 ${client.nick} ${channelCount} :channels formed`
);

client.send(
    `:${this.serverName} 255 ${client.nick} :I have 1 server`
);

const motd = [
    '══════════════════════════════════════════════════════════════',
    '\x0306  ___  ____   ___  ____',
    '\x0306 |_ _| |  _ \\ |_ _|/ ___|',
    '\x0306  | | | |_) | | | \\___ \\',
    '\x0306  | | |  _ <  | |  ___) |',
    '\x0306 |___|_| |_|\\_\\|___||____/',
    '',
    '\x0308 Modern Old IRC. Custom S2S-Protocol & Network.',
    '',
    '\x0304 ✦ \x0306 Welcome to  I R I S   I R C D  \x0304 ✦',
    '',
    '\x0307 DIY by Coderinna - Codetar - ninni :) <3',
    '',
    '\x0308 Nauti ajastasi ♥ Käytä IRISiä sovellettavien lakien mukaisesti.',
    '',
    ''
];

    console.log('══════════════════════════════════════════════════════════════');
    console.log('\x1b[36m%s\x1b[0m', '  ___  ____   ___  ____  ');
    console.log('\x1b[36m%s\x1b[0m', ' |_ _| |  _ \\ |_ _|/ ___| ');
    console.log('\x1b[36m%s\x1b[0m', '  | |  | |_) | | | \\___ \\  ');
    console.log('\x1b[36m%s\x1b[0m', '  | |  |  _ <  | |  ___) | ');
    console.log('\x1b[36m%s\x1b[0m', ' |___| |_| \\_\\|___||____/  ');
    console.log('🌸 ✨  I R I S   I R C D  ✨🌸');
        client.send(
            `:${this.serverName} 375 ${client.nick} :- ${this.serverName} viesti tänään -`
        );

        for (const line of motd) {
            client.send(
                `:${this.serverName} 372 ${client.nick} :-${line}`
            );
        }

        client.send(
            `:${this.serverName} 376 ${client.nick} :End of /MOTD command.`
        );

        console.log(
            `[${client.id}] Registered as ${client.nick}`
        );

        events.emit('client:registered', {
            client
        });

        return true;
    }

    unregisterClient(client) {
        if (!this.clients.has(client)) {
            return false;
        }

        this.cleanupClient(client);

        events.emit('client:unregistered', {
            client
        });

        return true;
    }

    cleanupClient(client) {
        for (const channel of [...client.channels]) {
            channel.removeClient(client);

            if (channel.isEmpty()) {
                this.channels.delete(channel.name);
            }
        }

        this.clients.delete(client);
    }

    getClientById(id) {
        if (!id) {
            return null;
        }

        return [...this.clients].find(
            client => client.id === id
        ) || null;
    }

    getClientByNick(nick) {
        if (!nick) {
            return null;
        }

        return [...this.clients].find(
            client =>
                client.nick &&
                client.nick.toLowerCase() === nick.toLowerCase()
        ) || null;
    }
}

module.exports = Core;