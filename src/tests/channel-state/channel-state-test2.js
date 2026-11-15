
const crypto = require('crypto');
const assert = require('assert');

const {
    encodeChannelState,
    decodeChannelState
} = require('../../s2s/messages/channel-state');

const {
    HEADER_SIZE
} = require('../../s2s/protocol/frame/frame');

console.log('[IRIS TEST] CHANNEL_STATE test started');

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
    members: [
        {
            clientId: 'client-123',
            nick: 'Tester',
            serverId: 'server-abc'
        }
    ]
};

try {
    const frame = encodeChannelState(
        data,
        crypto.randomBytes(16)
    );

    console.log('[IRIS TEST] ENCODE OK:', frame.length);

    const payload = frame.subarray(HEADER_SIZE);

    const decoded = decodeChannelState(payload);

    assert.deepStrictEqual(decoded, data);

    console.log('[IRIS TEST] DECODE OK');
    console.log('[IRIS TEST] MEMBERS OK');
    console.log('[IRIS TEST] CHANNEL STATE OK');
    console.log('[IRIS TEST] RESULT: PASS');

} catch (error) {
    console.error('[IRIS TEST] RESULT: FAIL');
    console.error(error.stack);
    process.exitCode = 1;
}
