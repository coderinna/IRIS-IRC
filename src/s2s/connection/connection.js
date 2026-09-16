const crypto = require('crypto');

const FrameParser = require('../protocol/parser');

const {
    TYPES,
    encodeFrame
} = require('../protocol/frame');

const {
    encodeHello,
    decodeHello
} = require('../messages/hello');

const {
    encodeAuth,
    decodeAuth
} = require('../messages/auth');

const {
    encodeServer,
    decodeServer
} = require('../messages/server');

const {
    encodeReady,
    decodeReady
} = require('../messages/ready');

const handleClient = require('./handlers/client');
const handleNick = require('./handlers/nick');
const handleJoin = require('./handlers/join');
const handlePart = require('./handlers/part');
const handleQuit = require('./handlers/quit');
const handleMessage = require('./handlers/message');

const STATES = {
    CONNECTING: 'connecting',
    HELLO: 'hello',
    AUTH: 'auth',
    SERVER: 'server',
    READY: 'ready',
    CONNECTED: 'connected',
    CLOSED: 'closed'
};

const ALLOWED_STATES = {
    [TYPES.HELLO]: [
        STATES.CONNECTING
    ],

    [TYPES.AUTH]: [
        STATES.AUTH
    ],

    [TYPES.SERVER]: [
        STATES.SERVER
    ],

    [TYPES.READY]: [
        STATES.READY
    ],

    [TYPES.CLIENT]: [
        STATES.CONNECTED
    ],

    [TYPES.NICK]: [
        STATES.CONNECTED
    ],

    [TYPES.JOIN]: [
        STATES.CONNECTED
    ],

    [TYPES.PART]: [
        STATES.CONNECTED
    ],

    [TYPES.QUIT]: [
        STATES.CONNECTED
    ],

    [TYPES.MESSAGE]: [
        STATES.CONNECTED
    ]
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
    options.authToken || null;

        this.state = STATES.CONNECTING;

        this.parser = new FrameParser();

this.maxChunkSize = 64 * 1024;
this.sendQueue = [];
this.sending = false;
this.maxSendQueue = 1000;


this.handshakeTimeout = setTimeout(() => {
    if (this.state !== STATES.CONNECTED) {
        console.error(
            '[IRISH] S2S handshake timeout'
        );

        this.socket.destroy();
    }
}, 10_000);

        this.remote = {
            serverId: null,
            serverName: null,
            serverVersion: null,
            serverRole: null,
            capabilities: []
        };

      this.messageIds = new Set();
this.maxMessageIds = 100_000;

        this.handlers = {
    [TYPES.HELLO]: frame => this.handleHello(frame),
    [TYPES.AUTH]: frame => this.handleAuth(frame),
    [TYPES.SERVER]: frame => this.handleServer(frame),
    [TYPES.READY]: frame => this.handleReady(frame),

    [TYPES.CLIENT]: frame => handleClient(this, frame),
    [TYPES.NICK]: frame => handleNick(this, frame),
    [TYPES.JOIN]: frame => handleJoin(this, frame),
    [TYPES.PART]: frame => handlePart(this, frame),
    [TYPES.QUIT]: frame => handleQuit(this, frame),
    [TYPES.MESSAGE]: frame => handleMessage(this, frame)
};

        this.setupSocket();
    }

    setupSocket() {
        this.socket.on('data', chunk => {
            this.handleData(chunk);
        });

this.socket.on('close', () => {
    this.cleanup();

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

    cleanup() {
    if (this.handshakeTimeout) {
        clearTimeout(this.handshakeTimeout);
        this.handshakeTimeout = null;
    }

    this.messageIds.clear();
    this.sendQueue.length = 0;

    this.state = STATES.CLOSED;
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
    if (
        this.socket.destroyed ||
        this.state === STATES.CLOSED
    ) {
        return false;
    }

    if (!Buffer.isBuffer(frame)) {
        throw new TypeError(
            'IRISH frame must be a Buffer'
        );
    }

    if (this.sendQueue.length >= this.maxSendQueue) {
        console.error(
            '[IRISH] S2S send queue limit exceeded'
        );

        this.socket.destroy();
        return false;
    }

    this.sendQueue.push(frame);

    this.flushSendQueue();

    return true;
}

flushSendQueue() {
    if (
        this.sending ||
        this.socket.destroyed ||
        this.state === STATES.CLOSED
    ) {
        return;
    }

    this.sending = true;

    while (this.sendQueue.length > 0) {
        const frame =
            this.sendQueue.shift();

        const canContinue =
            this.socket.write(frame);

        if (!canContinue) {
            this.socket.once('drain', () => {
                this.sending = false;
                this.flushSendQueue();
            });

            return;
        }
    }

    this.sending = false;
}

handleData(chunk) {
    if (chunk.length > this.maxChunkSize) {
        console.error(
            `[IRISH] S2S data chunk too large: ${chunk.length} bytes`
        );

        this.socket.destroy();
        return;
    }

    let frames;

    try {
        frames = this.parser.push(chunk);
    } catch (error) {
        console.error(
            '[IRISH] Parser error:',
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
    const now = Date.now();

    if (
        now - this.rateLimit.startedAt >=
        this.rateLimit.windowMs
    ) {
        this.rateLimit.startedAt = now;
        this.rateLimit.frames = 0;
    }

    this.rateLimit.frames++;

    if (
        this.rateLimit.frames >
        this.rateLimit.maxFrames
    ) {
        console.error(
            '[IRISH] S2S frame rate limit exceeded'
        );

        this.socket.destroy();
        return;
    }

    const messageId =
        frame.messageId.toString('hex');

    if (this.messageIds.has(messageId)) {
    console.log(
        `[IRISH] Duplicate message ignored: ${messageId}`
    );

    return;
}

this.messageIds.add(messageId);

if (this.messageIds.size > this.maxMessageIds) {
    const oldestMessageId =
        this.messageIds.values().next().value;

    this.messageIds.delete(oldestMessageId);
}

    const allowedStates =
        ALLOWED_STATES[frame.type];

    if (!allowedStates) {
        console.error(
            `[IRISH] Frame type not allowed: 0x${frame.type.toString(16)}`
        );

        this.socket.destroy();
        return;
    }

    if (!allowedStates.includes(this.state)) {
        console.error(
            `[IRISH] Frame 0x${frame.type.toString(16)} ` +
            `not allowed in state ${this.state}`
        );

        this.socket.destroy();
        return;
    }

    const handler =
        this.handlers[frame.type];

    if (!handler) {
        console.log(
            `[IRISH] Unknown frame type: 0x${frame.type.toString(16)}`
        );

        return;
    }

    handler(frame);
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

        if (!this.authToken) {
            throw new Error(
                'IRISH authentication token is not configured'
            );
        }

        if (typeof auth.token !== 'string') {
            throw new Error(
                'IRISH authentication token is invalid'
            );
        }

        const expectedToken =
            Buffer.from(this.authToken, 'utf8');

        const receivedToken =
            Buffer.from(auth.token, 'utf8');

        if (
            expectedToken.length !== receivedToken.length ||
            !crypto.timingSafeEqual(
                expectedToken,
                receivedToken
            )
        ) {
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


clearTimeout(this.handshakeTimeout);
this.handshakeTimeout = null;

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