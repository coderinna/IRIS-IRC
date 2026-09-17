// node server.js  - nodemon server.js

const net = require('net');

const config = require('./config/config');
const Core = require('./src/core');
const Client = require('./src/client/client');
const { parseLine } = require('./src/utilities/parser.js');
const numerics = require('./src/numerics/index.js');
const events = require('./src/events');
const connectS2S =
    require('./src/s2s/connector/connect.js');
const {
    createCommandRouter
} = require('./src/commands/router');

const S2SManager =
    require('./src/s2s/manager/manager.js');

const NetworkManager =
    require('./src/s2s/network-manager/network-manager.js');

const {
    S2SConnection
} = require('./src/s2s/connection/connection.js');

const {
    server: serverConfig
} = config;
const S2S_PEER_HOST =
    process.env.S2S_PEER_HOST || null;

const S2S_PEER_PORT =
    process.env.S2S_PEER_PORT
        ? Number(process.env.S2S_PEER_PORT)
        : null;
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


/*
 * ============================================================
 * IRC CLIENT SERVER
 * ============================================================
 */

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
 * ============================================================
 * S2S / IRISH NETWORK
 * ============================================================
 */

const S2S_PORT =
    Number(process.env.S2S_PORT || 7001);

const S2S_HOST =
    process.env.S2S_HOST || '127.0.0.1';

const S2S_SERVER_ID =
    process.env.SERVER_ID || 'iris-01';

const S2S_SERVER_NAME =
    process.env.SERVER_NAME || 'iris-01.local';

const S2S_SERVER_VERSION =
    process.env.SERVER_VERSION || 'iris-irc/0.1';

const S2S_SERVER_ROLE =
    process.env.SERVER_ROLE || 'hub';

const S2S_AUTH_TOKEN =
    process.env.S2S_AUTH_TOKEN || 'dev-secret';


const networkManager =
    new NetworkManager();


const s2sManager =
    new S2SManager({
        serverId: S2S_SERVER_ID,
        serverName: S2S_SERVER_NAME,
        networkManager
    });


const s2sServer =
    net.createServer(socket => {

        console.log(
            `[S2S] Incoming connection from ${socket.remoteAddress}:${socket.remotePort}`
        );

const connection =
    new S2SConnection(
        socket,
        {
            serverId: S2S_SERVER_ID,
            serverName: S2S_SERVER_NAME,
            serverVersion: S2S_SERVER_VERSION,
            serverRole: S2S_SERVER_ROLE,

            capabilities: [
                'message-id',
                'multiserver',
                'channel-sync'
            ],

            authToken: S2S_AUTH_TOKEN,

            manager: s2sManager,
            networkManager
        }
    );

s2sManager.addConnection(
    connection
);

console.log(
    `[S2S] Connection registered: ${S2S_SERVER_ID}`
);


        s2sManager.addConnection(
            connection
        );

        console.log(
            `[S2S] Connection registered: ${S2S_SERVER_ID}`
        );
    });


s2sServer.on('error', error => {

    console.error(
        '[S2S] Listener error:',
        error.message
    );

});


/*
 * ============================================================
 * DEBUG
 * ============================================================
 */

/*
console.log(
    '[STATUS]',
    status.getStatus(core)
);

setInterval(() => {
    console.log(
        '[METRICS]',
        metrics.getMetrics()
    );
}, 10000);
*/


/*
 * ============================================================
 * START SERVERS
 * ============================================================
 */

server.listen(PORT, HOST, () => {

    console.log(
        '💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕'
    );

    console.log(
        '              🌸 IRIS IRC 🌸'
    );

    console.log(
        '        ⚙️  Hardcore IRC Daemon, v1.0'
    );

    console.log(
        `          ❤️  Listening on ${HOST}:${PORT}`
    );

    console.log(
        '        🖤 Engineered with precision & attitude'
    );

    console.log(
        '        🚀 Ready for connections, babe!'
    );

    console.log(
        '💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕'
    );
});


s2sServer.listen(
    S2S_PORT,
    S2S_HOST,
    () => {

        console.log(
            `[S2S] Listening on ${S2S_HOST}:${S2S_PORT}`
        );

        console.log(
            `[S2S] Server ID: ${S2S_SERVER_ID}`
        );

    }
);

if (S2S_PEER_HOST && S2S_PEER_PORT) {

    connectS2S({
        manager: s2sManager,
        networkManager,

        host: S2S_PEER_HOST,
        port: S2S_PEER_PORT,

        serverId: S2S_SERVER_ID,
        serverName: S2S_SERVER_NAME,
        serverVersion: S2S_SERVER_VERSION,
        serverRole: S2S_SERVER_ROLE,

        capabilities: [
            'message-id',
            'multiserver',
            'channel-sync'
        ],

        authToken: S2S_AUTH_TOKEN
    });

}