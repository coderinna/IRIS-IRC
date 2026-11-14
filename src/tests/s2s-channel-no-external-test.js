
const assert = require('assert');

const Channel = require('../channel');
const handleChannel = require('../s2s/routing/forward/handlers/channel');

const SERVER_ID = 'iris-local';

function createClient({
    id,
    serverId,
    nick
}) {
    return {
        id,
        clientId: id,
        serverId,
        nick,
        user: 'test',
        host: 'localhost',
        channels: new Set(),
        received: [],

        send(message) {
            this.received.push(message);
        }
    };
}

function runTest({
    name,
    modeN = false,
    modeM = false,
    senderIsMember = false,
    senderRole = null,
    expectedMessages
}) {
    const channel = new Channel('#test');

    const sender = createClient({
        id: 'remote-1',
        serverId: 'iris-remote',
        nick: 'Remote'
    });

    const recipient = createClient({
        id: 'local-1',
        serverId: SERVER_ID,
        nick: 'Local'
    });

    channel.addClient(recipient);

    if (senderIsMember) {
        channel.addClient(sender);
    }

    if (modeN) {
        channel.addMode('n');
    }

    if (modeM) {
        channel.addMode('m');
    }

    if (senderRole === 'operator') {
        channel.addOperator(sender);
    }

    if (senderRole === 'voice') {
        channel.addVoice(sender);
    }

    const manager = {
        serverId: SERVER_ID,

        getLocalClientById(clientId) {
            return clientId === recipient.clientId
                ? recipient
                : null;
        },

        getRoute() {
            return null;
        }
    };

    const connection = { manager };

    const target = {
        type: 'channel',
        channel,
        clients: [...channel.clients]
    };

    const message = {
        messageId: 'test-message-1',
        serverId: sender.serverId,
        clientId: sender.clientId,
        target: '#test',
        message: 'Hello IRIS!'
    };

    handleChannel(
        connection,
        target,
        sender,
        message
    );

    assert.strictEqual(
        recipient.received.length,
        expectedMessages,
        `${name}: unexpected message count`
    );

    if (expectedMessages === 1) {
        assert.ok(
            recipient.received[0].includes('Hello IRIS!'),
            `${name}: message content incorrect`
        );
    }

    console.log(`✓ ${name}`);
}

console.log('=== IRIS S2S CHANNEL MODE TESTS ===\n');

// +n tests
runTest({
    name: '+n blocks non-member sender',
    modeN: true,
    senderIsMember: false,
    expectedMessages: 0
});

runTest({
    name: '+n allows channel member',
    modeN: true,
    senderIsMember: true,
    expectedMessages: 1
});

runTest({
    name: 'without +n allows non-member sender',
    expectedMessages: 1
});

// +m tests
runTest({
    name: '+m blocks ordinary member',
    modeM: true,
    senderIsMember: true,
    expectedMessages: 0
});

runTest({
    name: '+m allows channel operator',
    modeM: true,
    senderIsMember: true,
    senderRole: 'operator',
    expectedMessages: 1
});

runTest({
    name: '+m allows voiced member',
    modeM: true,
    senderIsMember: true,
    senderRole: 'voice',
    expectedMessages: 1
});

runTest({
    name: 'without +m allows ordinary member',
    senderIsMember: true,
    expectedMessages: 1
});

console.log('\n=== ALL TESTS PASSED ===');
