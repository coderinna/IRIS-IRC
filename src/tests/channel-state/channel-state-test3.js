// node src/tests/channel-state-test3.js

const assert = require('assert');

const {
    FIELDS,
    decodeChannelState
} = require('../../s2s/messages/channel-state');

const {
    encodeFields
} = require('../../s2s/protocol/tlv/tlv');

// 1. Normaali viesti
const validPayload = encodeFields([
    { type: FIELDS.CHANNEL, value: '#test' },
    { type: FIELDS.STATE, value: 'active' }
]);

const decoded = decodeChannelState(validPayload);

assert.strictEqual(decoded.channel, '#test');
assert.strictEqual(decoded.state, 'active');

console.log('[PASS] Normal CHANNEL_STATE accepted');

// 2. Duplikaattinen CHANNEL
const duplicatePayload = encodeFields([
    { type: FIELDS.CHANNEL, value: '#test' },
    { type: FIELDS.CHANNEL, value: '#other' },
    { type: FIELDS.STATE, value: 'active' }
]);

assert.throws(
    () => decodeChannelState(duplicatePayload),
    /duplicate field/
);

console.log('[PASS] Duplicate CHANNEL rejected');