
const assert = require('assert');
const crypto = require('crypto');

const NetworkManager = require('../s2s/network-manager/network-manager');

const handleChannelState = require('../s2s/connection/handlers/channel-state');

const {
    encodeChannelState
} = require('../s2s/messages/channel-state');

const {
    HEADER_SIZE
} = require('../s2s/protocol/frame/frame');

// NetworkManager ja olemassa oleva kanava
const networkManager = new NetworkManager();

const serverId = 'iris-01';
const clientId = 'client-existing';

const existingClient = networkManager.addClient({
    serverId,
    clientId,
    nick: 'ExistingUser',
    user: 'existing',
    host: 'localhost'
});

const channel = networkManager.addChannel({
    name: '#test',
    topic: 'Original topic',
    ownerServerId: serverId
});

networkManager.addClientToChannel('#test', existingClient);

// Saapuva tila sisältää tuntemattoman jäsenen
const data = {
    channel: '#test',
    topic: 'Modified topic',
    ownerServerId: 'iris-02',
    servers: ['iris-02'],
    members: [
        {
            serverId: 'iris-02',
            clientId: 'unknown-client',
            nick: 'UnknownUser'
        }
    ],
    state: {
        state: 'active',
        modes: ['i'],
        operators: []
    }
};

const encoded = encodeChannelState(
    data,
    crypto.randomBytes(16)
);

const frame = {
    payload: encoded.subarray(HEADER_SIZE)
};

const connection = {
    manager: { networkManager },
    remote: { serverId: 'iris-02' }
};

// Käsittele viesti
const result = handleChannelState(connection, frame);

// Virheellinen palautus pitää hylätä
assert.strictEqual(result, false);

// Alkuperäisen kanavatilan pitää säilyä
const restoredChannel = networkManager.getChannel('#test');

assert.strictEqual(restoredChannel.topic, 'Original topic');
assert.strictEqual(restoredChannel.ownerServerId, serverId);
assert.strictEqual(restoredChannel.clients.size, 1);
assert.ok(restoredChannel.clients.has(existingClient));

console.log('[PASS] Unknown CHANNEL_STATE member rejected');
console.log('[PASS] Existing channel state preserved');

console.log('[IRIS TEST] CHANNEL_STATE HANDLER ERRORS: ALL PASS');
