// node server.js  - nodemon server.js
const net = require('net');
const config = require('./config/config');
const Core = require('./src/core');
const Client = require('./src/client/client');
const { parseLine } = require('./src/utilities/parser.js');
const numerics = require('./src/numerics/index.js');
const events = require('./src/events');
const connectS2S = require('./src/s2s/connector/connect.js');
const { createCommandRouter } = require('./src/commands/router');
const S2SManager = require('./src/s2s/manager/manager.js');
const NetworkManager = require('./src/s2s/network-manager/network-manager.js');
const S2SListener = require('./src/s2s/listener/server.js');

const { server: serverConfig } = config;
const S2S_PEER_HOST = process.env.S2S_PEER_HOST || null;
const S2S_PEER_PORT = process.env.S2S_PEER_PORT ? Number(process.env.S2S_PEER_PORT) : null;
const S2S_PORT = Number(process.env.S2S_PORT || 7001);
const S2S_HOST = process.env.S2S_HOST || '127.0.0.1';
const S2S_SERVER_ID = process.env.SERVER_ID || 'iris-01';
const S2S_SERVER_NAME = process.env.SERVER_NAME || `${S2S_SERVER_ID}.local`;
const S2S_SERVER_VERSION = process.env.SERVER_VERSION || 'iris-irc/0.1';
const S2S_SERVER_ROLE = process.env.SERVER_ROLE || 'hub';
const S2S_AUTH_TOKEN = process.env.S2S_AUTH_TOKEN || 'dev-secret';

const PORT = process.env.PORT
    ? Number(process.env.PORT)
    : serverConfig.port;
const HOST = serverConfig.host;
const SERVER_NAME = serverConfig.name;

const core = new Core(SERVER_NAME);
const status = require('./src/services/status');
require('./src/services/logger');
require('./src/services/metrics');

const routeCommand = createCommandRouter({
    serverName: SERVER_NAME,
    core,
    status,
    registerClient: core.registerClient.bind(core),
    getOrCreateChannel: core.getOrCreateChannel.bind(core),
    getChannel: core.getChannel.bind(core),
    deleteChannel: core.deleteChannel.bind(core),
    getClientByNick: core.getClientByNick.bind(core),
    removeClient: core.removeClient.bind(core),
    events
});

const networkManager = new NetworkManager();

const s2sManager = new S2SManager({
    serverId: S2S_SERVER_ID,
    serverName: S2S_SERVER_NAME,
    networkManager
});

const s2sListener = new S2SListener({
    host: S2S_HOST,
    port: S2S_PORT,
    serverId: S2S_SERVER_ID,
    serverName: S2S_SERVER_NAME,
    serverVersion: S2S_SERVER_VERSION,
    serverRole: S2S_SERVER_ROLE,
    capabilities: ['message-id', 'multiserver', 'channel-sync'],
    authToken: S2S_AUTH_TOKEN,
    manager: s2sManager
});

const server = net.createServer(socket => {
   const client = new Client(
    socket,
    core,
    events,
    S2S_SERVER_ID
);
    socket.setNoDelay(true);

    socket.on('data', data => {
        const lines = data.toString().split('\r\n');

        for (const line of lines) {
            if (!line) continue;

            try {
                const parsed = parseLine(line);
                routeCommand(client, parsed);
            } catch (error) {
                console.error('[IRC] Command error:', error.message);
            }
        }
    });

    socket.on('error', error => {
        console.error('[IRC] Socket error:', error.message);
    });
});

server.listen(PORT, HOST, () => {
    console.log('💕--------------💕--------------------💕');
    console.log('              🌸 IRIS IRCd 🌸');
    console.log('        ⚙️  IRC Daemon, v1.0');
    console.log(`          ❤️  Listening on ${HOST}:${PORT}`);
    console.log('💕--------------💕--------------------💕');
});

s2sListener.start();

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
        capabilities: ['message-id', 'multiserver', 'channel-sync'],
        authToken: S2S_AUTH_TOKEN
    });
}