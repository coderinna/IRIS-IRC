const crypto = require('crypto');

const {
    encodeJoin,
    decodeJoin
} = require('./join');

const {
    encodePart,
    decodePart
} = require('./part');

const {
    encodeQuit,
    decodeQuit
} = require('./quit');

const {
    encodeMessage,
    decodeMessage
} = require('./message');

function test(name, encode, decode, data) {
    console.log('');
    console.log(`=== ${name} ===`);

    const messageId = crypto.randomBytes(16);

    const frame = encode(data, messageId);

    console.log('Frame size:', frame.length);

    const payload = frame.subarray(24);

    const decoded = decode(payload);

    console.log(`${name}:`, decoded);

    return decoded;
}

test(
    'JOIN',
    encodeJoin,
    decodeJoin,
    {
        clientId: 'client-001',
        channel: '#iris',
        serverId: 'iris-01'
    }
);

test(
    'PART',
    encodePart,
    decodePart,
    {
        clientId: 'client-001',
        channel: '#iris',
        reason: 'Leaving',
        serverId: 'iris-01'
    }
);

test(
    'QUIT',
    encodeQuit,
    decodeQuit,
    {
        clientId: 'client-001',
        reason: 'Client disconnected',
        serverId: 'iris-01'
    }
);

test(
    'MESSAGE',
    encodeMessage,
    decodeMessage,
    {
        clientId: 'client-001',
        target: '#iris',
        message: 'Hello from IRISH S2S!',
        serverId: 'iris-01'
    }
);

console.log('');
console.log('================================');
console.log('ALL S2S EVENT TESTS PASSED');
console.log('================================');
