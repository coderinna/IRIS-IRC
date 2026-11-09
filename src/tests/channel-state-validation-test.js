
const assert = require('assert');

const {
    encodeFields
} = require('../s2s/protocol/tlv/tlv');

const {
    FIELDS,
    MEMBER_FIELDS,
    decodeChannelState
} = require('../s2s/messages/channel-state');

// 1. Normaali CHANNEL_STATE
const validPayload = encodeFields([
    { type: FIELDS.CHANNEL, value: '#test' },
    { type: FIELDS.STATE, value: 'active' }
]);

const decoded = decodeChannelState(validPayload);

assert.strictEqual(decoded.channel, '#test');
assert.strictEqual(decoded.state, 'active');

console.log('[PASS] Normal CHANNEL_STATE accepted');

// 2. Duplikaattinen CHANNEL
const duplicateChannelPayload = encodeFields([
    { type: FIELDS.CHANNEL, value: '#test' },
    { type: FIELDS.CHANNEL, value: '#other' },
    { type: FIELDS.STATE, value: 'active' }
]);

assert.throws(
    () => decodeChannelState(duplicateChannelPayload),
    /duplicate field/
);

console.log('[PASS] Duplicate CHANNEL rejected');

// 3. Puuttuvat MEMBER-kentät
const missingMemberCases = [
    {
        name: 'clientId',
        fields: [
            { type: MEMBER_FIELDS.NICK, value: 'Tester' },
            { type: MEMBER_FIELDS.SERVER_ID, value: 'iris-01' }
        ]
    },
    {
        name: 'nick',
        fields: [
            { type: MEMBER_FIELDS.CLIENT_ID, value: 'client-123' },
            { type: MEMBER_FIELDS.SERVER_ID, value: 'iris-01' }
        ]
    },
    {
        name: 'serverId',
        fields: [
            { type: MEMBER_FIELDS.CLIENT_ID, value: 'client-123' },
            { type: MEMBER_FIELDS.NICK, value: 'Tester' }
        ]
    }
];

for (const testCase of missingMemberCases) {
    const memberPayload = encodeFields(testCase.fields);

    const payload = encodeFields([
        { type: FIELDS.CHANNEL, value: '#test' },
        { type: FIELDS.STATE, value: 'active' },
        { type: FIELDS.MEMBER, value: memberPayload }
    ]);

    assert.throws(
        () => decodeChannelState(payload),
        /missing fields/
    );

    console.log(`[PASS] MEMBER missing ${testCase.name} rejected`);
}

// 4. Duplikaattinen MEMBER-kenttä
const duplicateMemberPayload = encodeFields([
    { type: MEMBER_FIELDS.CLIENT_ID, value: 'client-123' },
    { type: MEMBER_FIELDS.CLIENT_ID, value: 'client-456' },
    { type: MEMBER_FIELDS.NICK, value: 'Tester' },
    { type: MEMBER_FIELDS.SERVER_ID, value: 'iris-01' }
]);

const duplicateMemberState = encodeFields([
    { type: FIELDS.CHANNEL, value: '#test' },
    { type: FIELDS.STATE, value: 'active' },
    { type: FIELDS.MEMBER, value: duplicateMemberPayload }
]);

assert.throws(
    () => decodeChannelState(duplicateMemberState),
    /duplicate member field/
);

console.log('[PASS] Duplicate MEMBER CLIENT_ID rejected');

console.log('[IRIS TEST] CHANNEL_STATE VALIDATION: ALL PASS');
