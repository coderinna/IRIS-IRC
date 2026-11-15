// node src/tests/channel-state-test.js

const crypto = require('crypto');
const assert = require('assert');

const {
    encodeChannelState,
    decodeChannelState
} = require('../../s2s/messages/channel-state');

const {
    HEADER_SIZE
} = require('../../s2s/protocol/frame/frame');

const data = {
    channel: '#test',
    topic: 'IRIS test',
    state: {
        state: 'active',
        modes: ['i', 'k', 'l'],
        key: 'secret123',
        limit: 25,
        operators: [
            {
                clientId: 'client-123',
                serverId: 'server-abc'
            }
        ]
    },
    ownerServerId: 'server-abc',
    servers: ['server-abc'],
    members: []
};

try {
    // Encode
    const frame = encodeChannelState(
        data,
        crypto.randomBytes(16)
    );

    console.log('ENCODE OK:', frame.length);

    // Decode payload
    const decoded = decodeChannelState(
        frame.subarray(HEADER_SIZE)
    );

    // Verify channel data
    assert.strictEqual(
        decoded.channel,
        data.channel
    );

    assert.strictEqual(
        decoded.topic,
        data.topic
    );

    assert.strictEqual(
        decoded.ownerServerId,
        data.ownerServerId
    );

    // Verify channel state
    assert.deepStrictEqual(
        decoded.state,
        data.state
    );

    assert.deepStrictEqual(
        decoded.servers,
        data.servers
    );

    assert.deepStrictEqual(
        decoded.members,
        data.members
    );

    console.log('DECODE OK');
    console.log('CHANNEL STATE ROUNDTRIP OK');

} catch (error) {
    console.error(
        'TEST FAILED:',
        error.stack
    );

    process.exitCode = 1;
}
