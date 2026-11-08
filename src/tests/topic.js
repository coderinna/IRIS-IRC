node - <<'NODE'
const crypto = require('crypto');

const {
    encodeTopic,
    decodeTopic
} = require('./src/s2s/messages/topic');

const data = {
    clientId: 'client-123',
    channel: '#test',
    topic: 'IRIS TOPIC test',
    serverId: 'server-abc'
};

const messageId = crypto.randomBytes(16);
const frame = encodeTopic(data, messageId);
const decoded = decodeTopic(frame.subarray(32));

console.log(decoded);

if (
    decoded.clientId === data.clientId &&
    decoded.channel === data.channel &&
    decoded.topic === data.topic &&
    decoded.serverId === data.serverId
) {
    console.log('[IRIS TOPIC TEST] PASS');
} else {
    console.error('[IRIS TOPIC TEST] FAIL');
    process.exitCode = 1;
}
NODE