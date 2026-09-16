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

const {
    encodePing,
    decodePing
} = require('../messages/ping');

const {
    encodeAck,
    decodeAck
} = require('../messages/ack');

const handleClient = require('./handlers/client');
const handleNick = require('./handlers/nick');
const handleJoin = require('./handlers/join');
const handlePart = require('./handlers/part');
const handleQuit = require('./handlers/quit');
const handleMessage = require('./handlers/message');
const handlePing = require('./handlers/ping.js');
const handlePong = require('./handlers/pong.js');
const handleAck = require('./handlers/ack.js');
const handleHello = require('./handlers/hello.js');
const handleAuth = require('./handlers/auth.js');
const handleServer = require('./handlers/server.js');
const handleReady = require('./handlers/ready.js');

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
    [TYPES.HELLO]: [    STATES.CONNECTING  ],
    [TYPES.AUTH]: [     STATES.AUTH  ],
    [TYPES.SERVER]: [     STATES.SERVER ],
    [TYPES.READY]: [     STATES.READY  ],
    [TYPES.CLIENT]: [     STATES.CONNECTED  ],
    [TYPES.NICK]: [      STATES.CONNECTED   ],
    [TYPES.JOIN]: [ STATES.CONNECTED    ],
    [TYPES.PART]: [     STATES.CONNECTED  ],
    [TYPES.QUIT]: [    STATES.CONNECTED ],
    [TYPES.MESSAGE]: [   STATES.CONNECTED ],
[TYPES.PING]: [STATES.CONNECTED],
[TYPES.PONG]: [STATES.CONNECTED],
[TYPES.ACK]: [STATES.CONNECTED],


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
this.pendingAcks = new Map();
this.maxPendingAcks = 10_000;

this.pendingAckTimeout = 30_000;
this.pendingAckCleanupInterval = null;

this.unknownAckCount = 0;
this.unknownAckWindowStartedAt = 0;
this.maxUnknownAcks = 20;
this.unknownAckWindow = 10_000;


this.sendSequence = 0n;
this.receiveSequence = 0n;

        this.handlers = {
    [TYPES.HELLO]: frame => handleHello(this, frame),
    [TYPES.READY]: frame => handleReady(this, frame),
    [TYPES.CLIENT]: frame => handleClient(this, frame),
    [TYPES.NICK]: frame => handleNick(this, frame),
    [TYPES.JOIN]: frame => handleJoin(this, frame),
    [TYPES.PART]: frame => handlePart(this, frame),
    [TYPES.QUIT]: frame => handleQuit(this, frame),
    [TYPES.MESSAGE]: frame => handleMessage(this, frame),
[TYPES.PING]: frame => handlePing(this, frame),
[TYPES.PONG]: frame => handlePong(this, frame),
[TYPES.ACK]: frame => handleAck(this, frame),
[TYPES.AUTH]: frame => handleAuth(this, frame),
[TYPES.SERVER]: frame => handleServer(this, frame),
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

    if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
        this.heartbeatTimeout = null;
    }

    if (this.pendingAckCleanupInterval) {
        clearInterval(
            this.pendingAckCleanupInterval
        );

        this.pendingAckCleanupInterval = null;
    }

    this.messageIds.clear();
    this.sendQueue.length = 0;

    this.state = STATES.CLOSED;
}

nextSendSequence() {
    const sequence = this.sendSequence;

    this.sendSequence++;

    return sequence;
}

startPendingAckCleanup() {
    if (this.pendingAckCleanupInterval) {
        return;
    }

    this.pendingAckCleanupInterval = setInterval(() => {
        const now = Date.now();

        for (const [
            messageId,
            pending
        ] of this.pendingAcks) {
            if (
                now - pending.createdAt >=
                this.pendingAckTimeout
            ) {
                this.pendingAcks.delete(
                    messageId
                );

                console.error(
                    `[IRISH] S2S ACK timeout: ${messageId}`
                );
            }
        }
    }, 5_000);
}

trackPendingAck(messageId) {
    const id = messageId.toString('hex');

    if (this.pendingAcks.size >= this.maxPendingAcks) {
        console.error(
            '[IRISH] S2S pending ACK limit exceeded'
        );

        this.socket.destroy();
        return false;
    }

    this.pendingAcks.set(id, {
        createdAt: Date.now()
    });

    return true;
}

sendTrackedFrame(frame, messageId) {
    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH tracked frame messageId must be a 16-byte Buffer'
        );
    }

    const id =
        messageId.toString('hex');

    if (!this.trackPendingAck(messageId)) {
        return false;
    }

    try {
        const sent =
            this.sendFrame(frame);

        if (!sent) {
            this.pendingAcks.delete(id);
        }

        return sent;

    } catch (error) {
        this.pendingAcks.delete(id);
        throw error;
    }
}

startHeartbeat() {
    if (this.heartbeatInterval) {
        return;
    }

    this.heartbeatInterval = setInterval(() => {
        if (
            this.state !== STATES.CONNECTED ||
            this.socket.destroyed
        ) {
            return;
        }

        const messageId = crypto.randomBytes(16);
        const sequence = this.nextSendSequence();

        const ping = encodePing(
            messageId,
            sequence
        );

        this.sendFrame(ping);

        console.log(
            `[IRISH] → PING ${this.remote.serverId}`
        );

        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }

        this.heartbeatTimeout = setTimeout(() => {
            console.error(
                `[IRISH] S2S heartbeat timeout: ${this.remote.serverId}`
            );

            this.socket.destroy();
        }, this.heartbeatTimeoutMs);
    }, this.heartbeatIntervalMs);
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

    const sequence =
        this.nextSendSequence();

    const frame = encodeHello({
        protocolVersion: 1,
        serverId: this.serverId,
        serverName: this.serverName,
        capabilities: this.capabilities
    }, messageId, sequence);

    this.sendFrame(frame);

    console.log(
        `[IRISH] → HELLO ${this.serverId}`
    );
}

sendAuth() {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        this.nextSendSequence();

    const frame = encodeAuth({
        method: 'token',
        serverId: this.serverId,
        token: this.authToken
    }, messageId, sequence);

    this.sendFrame(frame);

    console.log(
        `[IRISH] → AUTH ${this.serverId}`
    );
}

sendServer() {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        this.nextSendSequence();

    const frame = encodeServer({
        serverId: this.serverId,
        serverName: this.serverName,
        serverVersion: this.serverVersion,
        serverRole: this.serverRole
    }, messageId, sequence);

    this.sendFrame(frame);

    console.log(
        `[IRISH] → SERVER ${this.serverId}`
    );
}

sendReady() {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        this.nextSendSequence();

    const frame = encodeReady({
        serverId: this.serverId,
        status: 'ready'
    }, messageId, sequence);

    this.sendFrame(frame);

    console.log(
        `[IRISH] → READY ${this.serverId}`
    );
}

sendAck(acknowledgedMessageId) {
    if (
        !Buffer.isBuffer(acknowledgedMessageId) ||
        acknowledgedMessageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH ACK acknowledgedMessageId must be a 16-byte Buffer'
        );
    }

    const messageId =
        crypto.randomBytes(16);

    const sequence =
        this.nextSendSequence();

    const frame =
        encodeAck(
            acknowledgedMessageId,
            messageId,
            sequence
        );

    console.log(
        `[IRISH] → ACK ` +
        `${acknowledgedMessageId.toString('hex')}`
    );

    return this.sendFrame(frame);
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

    const type = frame.readUInt8(1);

    const requiresAck =
        type === TYPES.CLIENT ||
        type === TYPES.NICK ||
        type === TYPES.JOIN ||
        type === TYPES.PART ||
        type === TYPES.QUIT ||
        type === TYPES.MESSAGE;

    if (requiresAck) {
        const messageId =
            frame.subarray(16, 32);

        if (!this.trackPendingAck(messageId)) {
            return false;
        }
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
    if (frame.sequence !== this.receiveSequence) {
        console.error(
            `[IRISH] Invalid S2S sequence: expected ${this.receiveSequence}, received ${frame.sequence}`
        );

        this.socket.destroy();
        return;
    }

        if (
        !frame.messageId ||
        frame.messageId.length !== 16
    ) {
        console.error(
            '[IRISH] Invalid S2S messageId'
        );

        this.socket.destroy();
        return;
    }

    this.receiveSequence++;

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

    const handled = handler(frame);

    if (
        handled === true &&
        [
            TYPES.CLIENT,
            TYPES.NICK,
            TYPES.JOIN,
            TYPES.PART,
            TYPES.QUIT,
            TYPES.MESSAGE
        ].includes(frame.type)
    ) {
        this.sendAck(frame.messageId);
    }
}


}

module.exports = {
    S2SConnection,
    STATES
};