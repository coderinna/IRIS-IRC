// aja tämö projekctin juuuressa . krak
node - <<'NODE'
const crypto = require('crypto');

const { encodeChannelState } = require('./src/s2s/messages/channel-state');

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
    members: []
};

try {
    const frame = encodeChannelState(
        data,
        crypto.randomBytes(16)
    );

    console.log('ENCODE OK:', frame.length);
} catch (error) {
    console.error('ENCODE FAILED:', error.stack);
}
NODE