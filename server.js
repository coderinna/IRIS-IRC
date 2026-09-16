// node server.js  - nodemon server.js

const net = require('net');

const config = require('./config/config');
const Core = require('./src/core');
const Client = require('./src/client/client');
const { parseLine } = require('./src/utilities/parser.js');
const numerics = require('./src/numerics/index.js');
const events = require('./src/events');

const {
    createCommandRouter
} = require('./src/commands/router');

const {
    server: serverConfig
} = config;

const PORT = serverConfig.port;
const HOST = serverConfig.host;
const SERVER_NAME = serverConfig.name;

const core = new Core(SERVER_NAME);

const status = require('./src/services/status');
require('./src/services/logger');
require('./src/services/metrics');
// const metrics = require('./src/services/metrics');

const routeCommand = createCommandRouter({
    serverName: SERVER_NAME,
    core,
    status,
    registerClient: core.registerClient.bind(core),
    getOrCreateChannel: core.getOrCreateChannel.bind(core),
    getChannel: core.getChannel.bind(core),
    deleteChannel: core.deleteChannel.bind(core),
    getClientByNick: core.getClientByNick.bind(core),
    removeClient: core.removeClient.bind(core)
});

function handleCommand(client, line) {
    console.log(`[${client.id}] <- ${line}`);

    const parsed = parseLine(line);

    if (!parsed) {
        return;
    }

    const {
        command
    } = parsed;

    if (
        !client.registered &&
        !['CAP', 'NICK', 'USER', 'PING', 'PONG'].includes(command)
    ) {
        return;
    }

    const handled = routeCommand(client, parsed);

    if (!handled) {
        client.send(
            numerics.unknownCommand(
                SERVER_NAME,
                client.nick,
                command
            )
        );
    }
}

const server = net.createServer(socket => {
    const client = new Client(socket);

    core.addClient(client);

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
    core.unregisterClient(client);

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
/*
console.log(
    '[STATUS]',
    status.getStatus(core)
);
debug varten! 
setInterval(() => {
    console.log('[METRICS]', metrics.getMetrics());
}, 10000);
*/

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
    console.log('');
    console.log('              🌸 IRIS IRC 🌸');
    console.log('          ✨ Hardcore IRC Daemon ✨');
    console.log('');
    console.log(`          💗 Listening on ${HOST}:${PORT}`);
    console.log('          🎀 Ready for connections! 🎀');
    console.log('');
    console.log('💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
    console.log('');
});