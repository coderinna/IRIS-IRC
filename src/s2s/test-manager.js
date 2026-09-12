const net = require('net');

const {
    S2SConnection
} = require('./connection');

const S2SManager = require('./manager');

const events = require('../events');

const PORT = 7003;

const manager = new S2SManager({
    serverId: 'iris-01',
    serverName: 'iris-a.local'
});

const server = net.createServer(socket => {
    const connection = new S2SConnection(socket, {
        serverId: 'iris-02',
        serverName: 'iris-b.local',
        serverRole: 'leaf',
        authToken: 'test-secret-123'
    });

    manager.addConnection(connection);

    connection.start();
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(
        `[TEST] Listening on 127.0.0.1:${PORT}`
    );

    const socket = net.createConnection({
        host: '127.0.0.1',
        port: PORT
    });

    const connection = new S2SConnection(socket, {
        serverId: 'iris-01',
        serverName: 'iris-a.local',
        serverRole: 'hub',
        authToken: 'test-secret-123'
    });

    socket.on('connect', () => {
        connection.start();
    });

    setTimeout(() => {
        console.log('');
        console.log(
            '[TEST] Emitting client:registered'
        );

        events.emit('client:registered', {
            client: {
                id: 'client-001',
                nick: 'IrisTest',
                user: 'iris'
            }
        });
    }, 1000);
});

process.on('SIGINT', () => {
    console.log('\nStopping test...');

    server.close(() => {
        process.exit(0);
    });
});
