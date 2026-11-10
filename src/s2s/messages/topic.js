// src/s2s/messages/topic.js

const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv/tlv.js');

const FIELDS = {
    CLIENT_ID: 0x01,
    CHANNEL: 0x02,
    TOPIC: 0x03,
    SERVER_ID: 0x04
};

function encodeTopic({
    clientId,
    channel,
    topic,
    serverId
}, messageId, sequence = 0n) {
    if (
        !clientId ||
        !channel ||
        topic === undefined ||
        topic === null ||
        !serverId
    ) {
        throw new Error('IRIS TOPIC missing required fields');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRIS TOPIC messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        { type: FIELDS.CLIENT_ID, value: clientId },
        { type: FIELDS.CHANNEL, value: channel },
        { type: FIELDS.TOPIC, value: topic },
        { type: FIELDS.SERVER_ID, value: serverId }
    ];

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.TOPIC,
        messageId,
        sequence,
        payload
    });
}

function decodeTopic(payload) {
    const fields = decodeFields(payload);

    const topic = {
        clientId: null,
        channel: null,
        topic: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CLIENT_ID:
                topic.clientId = field.value.toString('utf8');
                break;
            case FIELDS.CHANNEL:
                topic.channel = field.value.toString('utf8');
                break;
            case FIELDS.TOPIC:
                topic.topic = field.value.toString('utf8');
                break;
            case FIELDS.SERVER_ID:
                topic.serverId = field.value.toString('utf8');
                break;
        }
    }

    if (
        !topic.clientId ||
        !topic.channel ||
        topic.topic === null ||
        !topic.serverId
    ) {
        throw new Error('IRIS TOPIC missing required fields');
    }

    return topic;
}

module.exports = {
    FIELDS,
    encodeTopic,
    decodeTopic
};
