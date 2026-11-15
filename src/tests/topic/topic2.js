
const crypto = require('crypto');
const {
    encodeTopic,
    decodeTopic
} = require('../../../src/s2s/messages/topic.js');

const data = {
    clientId: 'client-123',
    channel: '#test',
    topic: '',
    serverId: 'server-abc'
};

const frame = encodeTopic(data, crypto.randomBytes(16));
const decoded = decodeTopic(frame.subarray(32));

if (decoded.topic !== '') {
    console.error('[IRIS EMPTY TOPIC TEST] FAIL');
    process.exitCode = 1;
} else {
    console.log('[IRIS EMPTY TOPIC TEST] PASS');
}