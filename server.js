const net = require('net');

const config = require('./config/config');

const Client = require('./src/client');
const Channel = require('./src/channel');
const { parseLine } = require('./src/parser');

const { getCommand } = require('./src/commands/index');

const {
    server: serverConfig
} = config;

const PORT = serverConfig.port;
const HOST = serverConfig.host;
const SERVER_NAME = serverConfig.name;

const clients = new Set();
const channels = new Map();

function getOrCreateChannel(name) {
    if (!channels.has(name)) {
        channels.set(name, new Channel(name));
    }

    return channels.get(name);
}

function registerClient(client) {
    if (!client.register()) {
        return false;
    }

    client.send(
        `:${SERVER_NAME} 001 ${client.nick} :Welcome to Iris IRC`
    );

    client.send(
        `:${SERVER_NAME} 002 ${client.nick} :Your host is ${SERVER_NAME}`
    );

    client.send(
        `:${SERVER_NAME} 003 ${client.nick} :This server was created today`
    );

    client.send(
        `:${SERVER_NAME} 004 ${client.nick} ${SERVER_NAME} iris-irc 0`
    );

    console.log(
        `[${client.id}] Registered as ${client.nick}`
    );

    return true;
}

function cleanupClient(client) {
    for (const channel of [...client.channels]) {
        channel.removeClient(client);

        if (channel.isEmpty()) {
            channels.delete(channel.name);
        }
    }

    clients.delete(client);
}

function handleCommand(client, line) {
    console.log(`[${client.id}] <- ${line}`);

    const parsed = parseLine(line);

    if (!parsed) {
        return;
    }

    const {
        command,
        params,
        trailing
    } = parsed;

    const handler = getCommand(command);

    if (!handler) {
        client.send(
            numerics.unknownCommand(
                SERVER_NAME,
                client.nick,
                command
            )
        );

        return;
    }

    if (
        !client.registered &&
        !['CAP', 'NICK', 'USER', 'PING', 'PONG'].includes(command)
    ) {
        return;
    }

    switch (command) {
        case 'CAP':
            handler(
                client,
                params,
                SERVER_NAME
            );
            break;

        case 'NICK':
            handler(
                client,
                params[0],
                clients,
                registerClient,
                SERVER_NAME
            );
            break;

        case 'USER':
            handler(
                client,
                params[0],
                registerClient
            );
            break;

        case 'PING':
            handler(
                client,
                params,
                trailing
            );
            break;

        case 'JOIN':
            handler(
                client,
                params[0] || trailing,
                getOrCreateChannel,
                SERVER_NAME
            );
            break;

        case 'PART':
            handler(
                client,
                params[0],
                trailing || '',
                channels,
                SERVER_NAME
            );
            break;

        case 'PRIVMSG':
            handler(
                client,
                params[0],
                trailing,
                clients,
                channels,
                SERVER_NAME
            );
            break;

        case 'QUIT':
            handler(
                client,
                trailing || 'Quit',
                clients,
                channels
            );
            break;

        case 'MODE':
            handler(
                client,
                params,
                channels,
                SERVER_NAME
            );
            break;

        case 'WHO':
            handler(
                client,
                params[0],
                channels,
                SERVER_NAME
            );
            break;

        case 'PONG':
            handler(client);
            break;

        default:
            break;
    }
}

const server = net.createServer(socket => {
    const client = new Client(socket);

    clients.add(client);

    console.log(
        `Client connected: ${client.id}`
    );

    socket.setEncoding('utf8');

    socket.on('data', data => {
        client.buffer += data;

        let index;

        while ((index = client.buffer.indexOf('\n')) !== -1) {
            let line = client.buffer.slice(0, index);

            client.buffer = client.buffer.slice(index + 1);

            line = line.replace(/\r$/, '');

            if (line.length > 0) {
                handleCommand(client, line);
            }
        }
    });

    socket.on('close', () => {
        cleanupClient(client);

        console.log(
            `Client disconnected: ${client.id}`
        );
    });

    socket.on('error', error => {
        console.error(
            `[${client.id}] Socket error:`,
            error.message
        );
    });
});

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
    console.log('');
    console.log('              🌸 IRIS IRC 🌸');
    console.log('          ✨ Hardcore IRC Daemon✨');
    console.log('');
    console.log(`          💗 Listening on ${HOST}:${PORT}`);
    console.log('          🎀 Ready for connections! 🎀');
    console.log('');
    console.log('💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
    console.log('');
});