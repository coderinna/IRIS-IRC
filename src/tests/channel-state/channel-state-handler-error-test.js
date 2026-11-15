
const assert = require('assert');
const crypto = require('crypto');

const NetworkManager = require('../../s2s/network-manager/network-manager');

const handleChannelState = require('../../s2s/connection/handlers/channel-state');

const {
    encodeChannelState
} = require('../../s2s/messages/channel-state');

const {
    HEADER_SIZE
} = require('../../s2s/protocol/frame/frame');

function createTestEnvironment() {
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

    networkManager.addClientToChannel(
        '#test',
        existingClient
    );

    const connection = {
        manager: { networkManager },
        remote: { serverId: 'iris-02' }
    };

    return {
        networkManager,
        existingClient,
        connection
    };
}

function processChannelState(connection, data) {
    const encoded = encodeChannelState(
        data,
        crypto.randomBytes(16)
    );

    const frame = {
        payload: encoded.subarray(HEADER_SIZE)
    };

    return handleChannelState(connection, frame);
}

function assertOriginalChannelPreserved(
    networkManager,
    existingClient
) {
    const channel = networkManager.getChannel('#test');

    assert.strictEqual(
        channel.topic,
        'Original topic'
    );

    assert.strictEqual(
        channel.ownerServerId,
        'iris-01'
    );

    assert.strictEqual(
        channel.clients.size,
        1
    );

    assert.ok(
        channel.clients.has(existingClient)
    );
}

function createBaseState() {
    return {
        channel: '#test',
        topic: 'Modified topic',
        ownerServerId: 'iris-02',
        servers: ['iris-02'],
        members: [
            {
                serverId: 'iris-02',
                clientId: 'client-remote',
                nick: 'RemoteUser'
            }
        ],
        state: {
            state: 'active',
            modes: ['i'],
            operators: []
        }
    };
}

// TEST 1: Tuntematon jäsen

{
    const {
        networkManager,
        existingClient,
        connection
    } = createTestEnvironment();

    const data = createBaseState();

    data.members[0].clientId = 'unknown-client';

    const result = processChannelState(
        connection,
        data
    );

    assert.strictEqual(result, false);

    assertOriginalChannelPreserved(
        networkManager,
        existingClient
    );

    console.log('[PASS] Unknown CHANNEL_STATE member rejected');
    console.log('[PASS] Existing channel preserved after unknown member');
}

// TEST 2: Operators ei ole taulukko

{
    const {
        networkManager,
        existingClient,
        connection
    } = createTestEnvironment();

    const data = createBaseState();

    data.state.operators = {
        clientId: 'client-remote',
        serverId: 'iris-02'
    };

    const result = processChannelState(
        connection,
        data
    );

    assert.strictEqual(result, false);

    assertOriginalChannelPreserved(
        networkManager,
        existingClient
    );

    console.log('[PASS] Invalid operators field rejected');
    console.log('[PASS] Existing channel preserved after invalid operators');
}

// TEST 3: Operaattori ei kuulu kanavaan

{
    const {
        networkManager,
        existingClient,
        connection
    } = createTestEnvironment();

    const data = createBaseState();

    data.state.operators = [
        {
            serverId: 'iris-02',
            clientId: 'client-not-member'
        }
    ];

    const result = processChannelState(
        connection,
        data
    );

    assert.strictEqual(result, false);

    assertOriginalChannelPreserved(
        networkManager,
        existingClient
    );

    console.log('[PASS] Non-member operator rejected');
    console.log('[PASS] Existing channel preserved after invalid operator');
}

console.log('[IRIS TEST] CHANNEL_STATE HANDLER ERRORS: ALL PASS');
