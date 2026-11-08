const crypto = require('crypto');

const {
    encodeChannelState,
    decodeChannelState
} = require('../s2s/messages/channel-state');

console.log('[IRIS TEST] Test started');

const data = {
    channel: '#test',
    topic: 'IRIS test',
    state: {
        state: 'active',
        modes: ['i'],
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

const frame = encodeChannelState(data, crypto.randomBytes(16));
const payload = frame.subarray(32);
const decoded = decodeChannelState(payload);

console.log('\n[IRIS TEST] DECODED STATE:');
console.dir(decoded, { depth: null });

console.log('\n[IRIS TEST] RESULT:',
    JSON.stringify(decoded) === JSON.stringify(data)
        ? 'PASS'
        : 'CHECK OUTPUT'
);
