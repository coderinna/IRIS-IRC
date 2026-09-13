const net = require('net');

const {
    S2SConnection
} = require('./connection');

const PORT_A = 7001;
const PORT_B = 7002;

const AUTH_TOKEN = 'test-secret-123';

const serverB = net.createServer(socket => {
    console.log('[B] Incoming S2S connection');

    const connection = new S2SConnection(socket, {
        serverId: 'iris-02',
        serverName: 'iris-b.local',
        serverVersion: 'iris-irc/0.1',
        serverRole: 'leaf',
        authToken: AUTH_TOKEN
    });

    connection.start();
});

serverB.listen(PORT_B, '127.0.0.1', () => {
    console.log(`[B] Listening on 127.0.0.1:${PORT_B}`);

    const socket = net.createConnection({
        host: '127.0.0.1',
        port: PORT_B
    });

    const connectionA = new S2SConnection(socket, {
        serverId: 'iris-01',
        serverName: 'iris-a.local',
        serverVersion: 'iris-irc/0.1',
        serverRole: 'hub',
        authToken: AUTH_TOKEN
    });

    socket.on('connect', () => {
        console.log('[A] TCP connected');

        connectionA.start();
    });
});

process.on('SIGINT', () => {
    console.log('\nStopping IRISH test...');

    serverB.close(() => {
        process.exit(0);
    });
});