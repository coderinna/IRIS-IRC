/*
 * --------------------------------------------------
 * TEST test-manager.js. kommentti
 * --------------------------------------------------
 */

const net = require('net');

const NetworkManager =
    require('../network-manager/network-manager');
const S2SManager =
    require('../manager/manager');
const {
    S2SConnection
} = require('../connection/connection');
const events =
    require('../../events');

const PORT = 7003;
const HOST = '127.0.0.1';
const AUTH_TOKEN = 'test-secret-123';

/*
 * --------------------------------------------------
 * TEST CLIENT / CHANNEL
 * --------------------------------------------------
 */

const client = {
    id: 'client-001',
    nick: 'IrisNew',
    user: 'iris',
    host: 'localhost'
};

const channel = '#iris';

/*
 * --------------------------------------------------
 * SERVER A
 * --------------------------------------------------
 */

const networkA =
    new NetworkManager();

networkA.addServer({
    serverId: 'iris-02',
    serverName: 'iris-b.local',
    host: HOST,
    port: PORT,
    role: 'leaf'
});

const managerA =
    new S2SManager({
        serverId: 'iris-01',
        serverName: 'iris-a.local',
        networkManager: networkA
    });

/*
 * --------------------------------------------------
 * SERVER B
 * --------------------------------------------------
 */

const networkB =
    new NetworkManager();

networkB.addServer({
    serverId: 'iris-01',
    serverName: 'iris-a.local',
    host: HOST,
    port: PORT,
    role: 'hub'
});

const managerB =
    new S2SManager({
        serverId: 'iris-02',
        serverName: 'iris-b.local',
        networkManager: networkB
    });

/*
 * --------------------------------------------------
 * TCP SERVER
 * --------------------------------------------------
 */

const server =
    net.createServer(socket => {
        console.log(
            '[TEST] Incoming S2S connection'
        );

        const connection =
            new S2SConnection(
                socket,
                {
                    serverId: 'iris-02',
                    serverName: 'iris-b.local',
                    serverRole: 'leaf',
                    authToken: AUTH_TOKEN
                }
            );

        managerB.addConnection(
            connection
        );

        connection.start();
    });

/*
 * --------------------------------------------------
 * START TEST NETWORK
 * --------------------------------------------------
 */

server.listen(
    PORT,
    HOST,
    () => {
        console.log(
            `[TEST] iris-b listening on ` +
            `${HOST}:${PORT}`
        );

        const socket =
            net.createConnection({
                host: HOST,
                port: PORT
            });

        const connection =
            new S2SConnection(
                socket,
                {
                    serverId: 'iris-01',
                    serverName: 'iris-a.local',
                    serverRole: 'hub',
                    authToken: AUTH_TOKEN
                }
            );

        managerA.addConnection(
            connection
        );

        socket.on(
            'connect',
            () => {
                console.log(
                    '[TEST] iris-a connected to iris-b'
                );

                connection.start();
            }
        );

        /*
         * CLIENT
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting client:registered'
            );

            events.emit(
                'client:registered',
                { client }
            );
        }, 1000);

        /*
         * NICK
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting client:nick_changed'
            );

            events.emit(
                'client:nick_changed',
                {
                    client,
                    oldNick: 'IrisTest',
                    newNick: 'IrisNew'
                }
            );
        }, 2000);

        /*
         * JOIN
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting channel:joined'
            );

            events.emit(
                'channel:joined',
                {
                    client,
                    channel
                }
            );
        }, 3000);

        /*
         * MESSAGE
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting message:sent'
            );

            events.emit(
                'message:sent',
                {
                    client,
                    target: channel,
                    message: 'Hello from Iris'
                }
            );
        }, 4000);

        /*
         * PART
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting channel:parted'
            );

            events.emit(
                'channel:parted',
                {
                    client,
                    channel,
                    reason: 'test'
                }
            );
        }, 5000);

        /*
         * QUIT
         */

        setTimeout(() => {
            console.log(
                '[TEST] Emitting client:quit'
            );

            events.emit(
                'client:quit',
                {
                    client,
                    reason: 'Test complete'
                }
            );
        }, 6000);
    }
);

/*
 * --------------------------------------------------
 * SHUTDOWN
 * --------------------------------------------------
 */

process.on(
    'SIGINT',
    () => {
        console.log(
            '\nStopping S2S test...'
        );

        server.close(
            () => {
                process.exit(0);
            }
        );
    }
);