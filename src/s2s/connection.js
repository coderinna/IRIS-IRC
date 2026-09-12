const crypto = require('crypto');

const FrameParser = require('./parser');

const {
    TYPES,
    encodeFrame
} = require('./frame');

const {
    encodeHello,
    decodeHello
} = require('./hello');

const {
    encodeAuth,
    decodeAuth
} = require('./auth');

const {
    encodeServer,
    decodeServer
} = require('./server');

const {
    encodeReady,
    decodeReady
} = require('./ready');

const {
    decodeClient
} = require('./client');

const STATES = {
    CONNECTING: 'connecting',
    HELLO: 'hello',
    AUTH: 'auth',
    SERVER: 'server',
    READY: 'ready',
    CONNECTED: 'connected',
    CLOSED: 'closed'
};

class S2SConnection {
    constructor(socket, options = {}) {
        this.socket = socket;

        this.serverId =
            options.serverId || 'iris-01';

        this.serverName =
            options.serverName || 'iris.local';

        this.serverVersion =
            options.serverVersion || 'iris-irc/0.1';

        this.serverRole =
            options.serverRole || 'hub';

        this.capabilities =
            options.capabilities || [
                'message-id',
                'multiserver',
                'channel-sync'
            ];

        this.authToken =
            options.authToken || 'test-secret-123';

        this.state = STATES.CONNECTING;

        this.parser = new FrameParser();

        this.remote = {
            serverId: null,
            serverName: null,
            serverVersion: null,
            serverRole: null,
            capabilities: []
        };

        this.messageIds = new Set();

        this.setupSocket();
    }

    setupSocket() {
        this.socket.on('data', chunk => {
            this.handleData(chunk);
        });

        this.socket.on('close', () => {
            this.state = STATES.CLOSED;

            console.log(
                `[IRISH] Connection closed: ${this.remote.serverId || 'unknown'}`
            );
        });

        this.socket.on('error', error => {
            console.error(
                '[IRISH] Socket error:',
                error.message
            );
        });
    }

    start() {
        this.state = STATES.HELLO;

        console.log(
            `[IRISH] Starting handshake as ${this.serverId}`
        );

        this.sendHello();
    }

    sendHello() {
        const messageId =
            crypto.randomBytes(16);

        const frame = encodeHello({
            protocolVersion: 1,
            serverId: this.serverId,
            serverName: this.serverName,
            capabilities: this.capabilities
        }, messageId);

        this.sendFrame(frame);

        console.log(
            `[IRISH] → HELLO ${this.serverId}`
        );
    }

    sendAuth() {
        const messageId =
            crypto.randomBytes(16);

        const frame = encodeAuth({
            method: 'token',
            serverId: this.serverId,
            token: this.authToken
        }, messageId);

        this.sendFrame(frame);

        console.log(
            `[IRISH] → AUTH ${this.serverId}`
        );
    }

    sendServer() {
        const messageId =
            crypto.randomBytes(16);

        const frame = encodeServer({
            serverId: this.serverId,
            serverName: this.serverName,
            serverVersion: this.serverVersion,
            serverRole: this.serverRole
        }, messageId);

        this.sendFrame(frame);

        console.log(
            `[IRISH] → SERVER ${this.serverId}`
        );
    }

    sendReady() {
        const messageId =
            crypto.randomBytes(16);

        const frame = encodeReady({
            serverId: this.serverId,
            status: 'ready'
        }, messageId);

        this.sendFrame(frame);

        console.log(
            `[IRISH] → READY ${this.serverId}`
        );
    }

    sendFrame(frame) {
        if (!this.socket.destroyed) {
            this.socket.write(frame);
        }
    }

    handleData(chunk) {
        let frames;

        try {
            frames = this.parser.push(chunk);
        } catch (error) {
            console.error(
                '[IRISH] Frame parser error:',
                error.message
            );

            this.socket.destroy();
            return;
        }

        for (const frame of frames) {
            this.handleFrame(frame);
        }
    }

    handleFrame(frame) {
        const messageId =
            frame.messageId.toString('hex');

        if (this.messageIds.has(messageId)) {
            console.log(
                `[IRISH] Duplicate message ignored: ${messageId}`
            );

            return;
        }

        this.messageIds.add(messageId);

        switch (frame.type) {
            case TYPES.HELLO:
                this.handleHello(frame);
                break;

            case TYPES.AUTH:
                this.handleAuth(frame);
                break;

            case TYPES.SERVER:
                this.handleServer(frame);
                break;

            case TYPES.READY:
                this.handleReady(frame);
                break;

                case TYPES.CLIENT:
    this.handleClient(frame);
    break;

            default:
                console.log(
                    `[IRISH] Unknown frame type: 0x${frame.type.toString(16)}`
                );
        }
    }

    handleHello(frame) {
        try {
            const hello =
                decodeHello(frame.payload);

            this.remote.serverId =
                hello.serverId;

            this.remote.serverName =
                hello.serverName;

            this.remote.capabilities =
                hello.capabilities;

            console.log(
                `[IRISH] ← HELLO ${hello.serverId}`
            );

            this.state = STATES.AUTH;

            this.sendAuth();
        } catch (error) {
            console.error(
                '[IRISH] Invalid HELLO:',
                error.message
            );

            this.socket.destroy();
        }
    }

    handleAuth(frame) {
        try {
            const auth =
                decodeAuth(frame.payload);

            console.log(
                `[IRISH] ← AUTH ${auth.serverId}`
            );

            if (auth.token !== this.authToken) {
                console.error(
                    `[IRISH] Authentication failed for ${auth.serverId}`
                );

                this.socket.destroy();
                return;
            }

            this.state = STATES.SERVER;

            this.sendServer();
        } catch (error) {
            console.error(
                '[IRISH] Invalid AUTH:',
                error.message
            );

            this.socket.destroy();
        }
    }

    handleServer(frame) {
        try {
            const server =
                decodeServer(frame.payload);

            this.remote.serverId =
                server.serverId;

            this.remote.serverName =
                server.serverName;

            this.remote.serverVersion =
                server.serverVersion;

            this.remote.serverRole =
                server.serverRole;

            console.log(
                `[IRISH] ← SERVER ${server.serverId} ` +
                `${server.serverName} ` +
                `(${server.serverRole})`
            );

            this.state = STATES.READY;

            this.sendReady();
        } catch (error) {
            console.error(
                '[IRISH] Invalid SERVER:',
                error.message
            );

            this.socket.destroy();
        }
    }

    handleClient(frame) {
    try {
        const client =
            decodeClient(frame.payload);

        console.log(
            `[IRISH] ← CLIENT ` +
            `${client.clientId} ` +
            `${client.nick} ` +
            `from ${client.serverId}`
        );

    } catch (error) {
        console.error(
            '[IRISH] Invalid CLIENT:',
            error.message
        );

        this.socket.destroy();
    }
}

    handleReady(frame) {
        try {
            const ready =
                decodeReady(frame.payload);

            if (ready.status !== 'ready') {
                throw new Error(
                    `Remote server is not ready: ${ready.status}`
                );
            }

            console.log(
                `[IRISH] ← READY ${ready.serverId}`
            );

            this.state = STATES.CONNECTED;

            console.log(
                `[IRISH] ✓ CONNECTED ${this.remote.serverId}`
            );
        } catch (error) {
            console.error(
                '[IRISH] Invalid READY:',
                error.message
            );

            this.socket.destroy();
        }
    }
}

module.exports = {
    S2SConnection,
    STATES
};