
const crypto = require('crypto');
const assert = require('assert');

const NetworkManager =
    require('../s2s/network-manager/network-manager');

const handleChannelState =
    require('../s2s/connection/handlers/channel-state');

const {
    encodeChannelState
} = require('../s2s/messages/channel-state');

const {
    HEADER_SIZE
} = require('../s2s/protocol/frame/frame');

const networkManager = new NetworkManager();

const serverId = 'iris-02';
const clientId = 'client-123';

// Register remote client
networkManager.addClient({
    serverId,
    clientId,
    nick: 'Tester',
    user: 'tester',
    host: 'localhost'
});

// Channel state
const state = {
    state: 'active',
    modes: ['i', 'k', 'l'],
    key: 'secret123',
    limit: 25,
    operators: [
        {
            serverId,
            clientId
        }
    ]
};

// CHANNEL_STATE data
const data = {
    channel: '#test',
    topic: 'IRIS channel state test',
    ownerServerId: serverId,
    servers: [serverId],
    members: [
        {
            serverId,
            clientId,
            nick: 'Tester'
        }
    ],
    state
};

// Encode message
const encoded = encodeChannelState(
    data,
    crypto.randomBytes(16)
);
// Extract payload
const frame = {
    payload: encoded.subarray(HEADER_SIZE)
};

// Mock S2S connection
const connection = {
    manager: {
        networkManager
    },
    remote: {
        serverId: 'iris-01'
    }
};

// Handle incoming CHANNEL_STATE
const result = handleChannelState(
    connection,
    frame
);

assert.strictEqual(result, true);

// Verify restored channel
const channel =
    networkManager.getChannel('#test');

assert.ok(channel);

assert.strictEqual(
    channel.topic,
    data.topic
);

assert.strictEqual(
    channel.ownerServerId,
    serverId
);

assert.strictEqual(
    channel.state,
    'active'
);

assert.deepStrictEqual(
    [...channel.modes],
    ['i', 'k', 'l']
);

assert.strictEqual(
    channel.key,
    'secret123'
);

assert.strictEqual(
    channel.limit,
    25
);

assert.strictEqual(
    channel.clients.size,
    1
);

assert.strictEqual(
    channel.servers.has(serverId),
    true
);

assert.strictEqual(
    channel.operators.size,
    1
);

assert.ok(
    channel.operators.has(
        networkManager.getClient(
            serverId,
            clientId
        )
    )
);

console.log(
    '[IRIS TEST] CHANNEL_STATE HANDLER: PASS'
);
