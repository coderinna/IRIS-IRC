const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const {
    encodeMessage,
    decodeMessage
} = require('../messages/message');

const FrameParser =
    require('../protocol/parser');

const S2SManager =
    require('../manager/manager');


console.log('');
console.log('🌸 IRIS MESSAGE / LOOP PREVENTION TESTS');
console.log('=========================================');


// --------------------------------------------------
// TEST 1
// messageId validation
// --------------------------------------------------

console.log('');
console.log('TEST 1: messageId validation');

assert.throws(
    () => {
        encodeMessage(
            {
                clientId: 'client-01',
                target: 'bob',
                message: 'hello',
                serverId: 'iris-01'
            },
            Buffer.alloc(8)
        );
    },
    /16-byte Buffer/
);

console.log('✓ invalid messageId rejected');


// --------------------------------------------------
// TEST 2
// MESSAGE encode
// --------------------------------------------------

console.log('');
console.log('TEST 2: MESSAGE encode');

const messageId =
    crypto.randomBytes(16);

const frame =
    encodeMessage(
        {
            clientId: 'client-01',
            target: 'bob',
            message: 'hello',
            serverId: 'iris-01'
        },
        messageId
    );

assert.ok(
    Buffer.isBuffer(frame),
    'Encoded MESSAGE must be a Buffer'
);

console.log('✓ MESSAGE encoded');


// --------------------------------------------------
// TEST 3
// IRISH FrameParser säilyttää messageId:n
// --------------------------------------------------

console.log('');
console.log('TEST 3: messageId survives frame parser');

const parser =
    new FrameParser();

const frames =
    parser.push(frame);

assert.equal(
    frames.length,
    1
);

const parsed =
    frames[0];

assert.ok(
    Buffer.isBuffer(parsed.messageId),
    'Parsed frame must contain Buffer messageId'
);

assert.equal(
    parsed.messageId.toString('hex'),
    messageId.toString('hex')
);

console.log(
    '✓ messageId survives frame encode → parser'
);


// --------------------------------------------------
// TEST 4
// MESSAGE decode saa frame.messageId:n
// --------------------------------------------------

console.log('');
console.log('TEST 4: messageId survives MESSAGE decode');

const decoded =
    decodeMessage(
        parsed.payload,
        parsed.messageId
    );

assert.ok(
    Buffer.isBuffer(decoded.messageId),
    'Decoded MESSAGE must contain messageId'
);

assert.equal(
    decoded.messageId.toString('hex'),
    messageId.toString('hex')
);

assert.equal(
    decoded.clientId,
    'client-01'
);

assert.equal(
    decoded.target,
    'bob'
);

assert.equal(
    decoded.message,
    'hello'
);

assert.equal(
    decoded.serverId,
    'iris-01'
);

console.log(
    '✓ messageId survives frame → MESSAGE decode'
);


// --------------------------------------------------
// TEST 5
// Ensimmäinen event hyväksytään
// --------------------------------------------------

console.log('');
console.log('TEST 5: first MESSAGE event accepted');

const manager =
    new S2SManager({
        serverId: 'iris-02',
        serverName: 'iris-02.local',
        networkManager: {},
        getLocalClientByNick: () => null
    });

const event = {
    eventId:
        decoded.messageId.toString('hex'),

    type: 'MESSAGE',

    serverId:
        decoded.serverId,

    clientId:
        decoded.clientId,

    payload:
        decoded
};

assert.equal(
    manager.acceptEvent(event),
    true
);

console.log(
    '✓ first MESSAGE accepted'
);


// --------------------------------------------------
// TEST 6
// Sama event hylätään
// --------------------------------------------------

console.log('');
console.log('TEST 6: duplicate MESSAGE rejected');

assert.equal(
    manager.acceptEvent(event),
    false
);

console.log(
    '✓ duplicate MESSAGE rejected'
);


// --------------------------------------------------
// TEST 7
// Registry sisältää vain yhden eventin
// --------------------------------------------------

console.log('');
console.log('TEST 7: duplicate does not increase registry');

assert.equal(
    manager.eventRegistry.size(),
    1
);

console.log(
    '✓ registry contains exactly one event'
);


// --------------------------------------------------
// TEST 8
// Uusi messageId hyväksytään
// --------------------------------------------------

console.log('');
console.log('TEST 8: new MESSAGE accepted');

const secondMessageId =
    crypto.randomBytes(16);

const secondEvent = {
    eventId:
        secondMessageId.toString('hex'),

    type: 'MESSAGE',

    serverId: 'iris-01',

    clientId: 'client-01',

    payload: {
        messageId:
            secondMessageId
    }
};

assert.equal(
    manager.acceptEvent(secondEvent),
    true
);

console.log(
    '✓ new MESSAGE accepted'
);


// --------------------------------------------------
// TEST 9
// Kaksi eri eventtiä rekisterissä
// --------------------------------------------------

console.log('');
console.log('TEST 9: registry tracks unique events');

assert.equal(
    manager.eventRegistry.size(),
    2
);

console.log(
    '✓ two unique MESSAGE events tracked'
);


// --------------------------------------------------
// DONE
// --------------------------------------------------

console.log('');
console.log('=========================================');
console.log('🌸 ALL MESSAGE TESTS PASSED 🌸');
console.log('=========================================');
console.log('');