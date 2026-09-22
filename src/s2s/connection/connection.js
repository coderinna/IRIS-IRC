// src/s2s/connections/connection.js

const crypto = require('crypto');

const FrameParser = require('../protocol/parser/parser.js');

const lifecycle = require('./lifecycle/index.js');
const transport = require('./transport/index.js');
const acknowledgements =   require('./ack-nowledgements/index.js');
const heartbeat =  require('./heartbeat/index.js');
const validation =   require('./validation/index.js');
const deduplication =   require('./deduplication/index.js');
const stateValidation =  require('./state-validation/index.js');
const messages =
    require('./messages/index.js');
const outboundValidation =  require('./outbound-validation/index.js');

const {   STATES } = require('./states.js');

const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

const MAX_SEQUENCE =
    0xffffffffffffffffn;

const handleClient = require('./handlers/client');
const handleNick = require('./handlers/nick');
const handleJoin = require('./handlers/join');
const handlePart = require('./handlers/part');
const handleQuit = require('./handlers/quit');
const handleMessage = require('./handlers/message');
    const handleNotice = require('./handlers/notice');
const handlePing = require('./handlers/ping.js');
const handlePong = require('./handlers/pong.js');
const handleAck = require('./handlers/ack.js');
const handleHello = require('./handlers/hello.js');
const handleAuth = require('./handlers/auth.js');
const handleServer = require('./handlers/server.js');
const handleReady = require('./handlers/ready.js');

class S2SConnection {
    constructor(socket, options = {}) {
        this.socket = socket;

                this.manager =
            options.manager || null;

        this.networkManager =
            options.networkManager ||
            this.manager?.networkManager ||
            null;


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


lifecycle.startHandshakeTimeout(this);

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

this.rateLimit = {
    startedAt: Date.now(),
    windowMs: 10_000,
    frames: 0,
    maxFrames: 1_000
};

this.heartbeatInterval = null;
this.heartbeatTimeout = null;
this.heartbeatIntervalMs = 10_000;
this.heartbeatTimeoutMs = 5_000;

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
    [TYPES.NOTICE]: frame => handleNotice(this, frame),
[TYPES.PING]: frame => handlePing(this, frame),
[TYPES.PONG]: frame => handlePong(this, frame),
[TYPES.ACK]: frame => handleAck(this, frame),
[TYPES.AUTH]: frame => handleAuth(this, frame),
[TYPES.SERVER]: frame => handleServer(this, frame),
};

        this.setupSocket();
    }

setupSocket() {
    transport.setupSocket(this);
}

cleanup() {
    lifecycle.cleanup(this);
}

destroy() {
    lifecycle.destroy(this);
}

nextSendSequence() {
    if (
        this.sendSequence >
        MAX_SEQUENCE
    ) {
        throw new Error(
            'IRISH outbound sequence exhausted'
        );
    }

    const sequence =
        this.sendSequence;

    this.sendSequence++;

    return sequence;
}

startPendingAckCleanup() {
    acknowledgements.startPendingAckCleanup(this);
}

trackPendingAck(messageId, frame) {
    return acknowledgements.trackPendingAck(
        this,
        messageId,
        frame
    );
}

sendTrackedFrame(frame, messageId) {
    return acknowledgements.sendTrackedFrame(
        this,
        frame,
        messageId
    );
}

startHeartbeat() {
    heartbeat.startHeartbeat(this);
}

start() {
    lifecycle.start(this);
}

sendHello() {
    return messages.sendHello(this);
}

sendAuth() {
    return messages.sendAuth(this);
}

sendServer(server = null) {
    return messages.sendServer(
        this,
        server
    );
}

sendReady() {
    return messages.sendReady(this);
}

sendAck(acknowledgedMessageId) {
    return messages.sendAck(
        this,
        acknowledgedMessageId
    );
}

sendFrame(frame) {
    if (
        !outboundValidation.validateOutgoingFrame(
            this,
            frame
        )
    ) {
        return false;
    }

    return transport.sendFrame(
        this,
        frame
    );
}

flushSendQueue() {
    transport.flushSendQueue(this);
}

handleData(chunk) {
    transport.handleData(
        this,
        chunk
    );
}

handleFrame(frame) {
        console.log(
        `[IRIS] ← FRAME type=0x${frame.type.toString(16)} ` +
        `messageId=${frame.messageId?.toString('hex') || 'none'}`
    );

    if (
        !validation.validateIncomingFrame(
            this,
            frame
        )
    ) {
        return;
    }

    if (
        deduplication.isDuplicate(
            this,
            frame.messageId
        )
    ) {
        return;
    }

    if (
        !stateValidation.validateState(
            this,
            frame
        )
    ) {
        return;
    }

    const handler =
        this.handlers[frame.type];

        console.log(
    `[IRIS] DISPATCH FRAME type=0x${frame.type.toString(16)}`
);

    if (!handler) {
        console.log(
            `[IRIS] Unknown frame type: ` +
            `0x${frame.type.toString(16)}`
        );

        return;
    }

    const handled =
        handler(frame);

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
        this.sendAck(
            frame.messageId
        );
    }
}


}

module.exports = {
    S2SConnection,
    STATES
};