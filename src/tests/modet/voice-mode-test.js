const assert = require('assert');

const {
    encodeMode,
    decodeMode
} = require('../../s2s/messages/mode');

const crypto = require('crypto');

console.log('=== IRIS +v MODE TEST ===');

const messageId = crypto.randomBytes(16);

const original = {
    clientId: 'client-123',
    channel: '#test',
    mode: '+v',
    targetNick: 'Alice',
    serverId: 'iris-01',
    modeParam: 'Alice'
};

const frame = encodeMode(
    original,
    messageId,
    1n
);

assert(Buffer.isBuffer(frame));
console.log('✓ MODE frame encoded');

const payload = frame.subarray(32);

const decoded = decodeMode(payload);

assert.strictEqual(decoded.clientId, original.clientId);
assert.strictEqual(decoded.channel, original.channel);
assert.strictEqual(decoded.mode, '+v');
assert.strictEqual(decoded.targetNick, 'Alice');
assert.strictEqual(decoded.serverId, original.serverId);
assert.strictEqual(decoded.modeParam, 'Alice');

console.log('✓ +v MODE decoded correctly');

console.log('Decoded MODE:', decoded);

console.log('=== +v MODE TEST PASSED ===');