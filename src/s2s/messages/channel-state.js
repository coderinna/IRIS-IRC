
const {
    TYPES,
    encodeFrame
} = require('../protocol/frame/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv/tlv.js');

const FIELDS = {
    CHANNEL: 0x01,
    TOPIC: 0x02,
    STATE: 0x03,
    OWNER_SERVER_ID: 0x04,
    SERVER_ID: 0x05,
    MEMBER: 0x06
};

const MEMBER_FIELDS = {
    CLIENT_ID: 0x01,
    NICK: 0x02,
    SERVER_ID: 0x03
};

const STATES = {
    ACTIVE: 'active',
    EMPTY: 'empty'
};

function encodeMember({
    clientId,
    nick,
    serverId
}) {
    if (!clientId || !nick || !serverId) {
        throw new Error(
            'IRIS CHANNEL_STATE member requires clientId, nick and serverId'
        );
    }

    return encodeFields([
        {
            type: MEMBER_FIELDS.CLIENT_ID,
            value: clientId
        },
        {
            type: MEMBER_FIELDS.NICK,
            value: nick
        },
        {
            type: MEMBER_FIELDS.SERVER_ID,
            value: serverId
        }
    ]);
}

function decodeMember(payload) {
    const fields = decodeFields(payload);

    const member = {
        clientId: null,
        nick: null,
        serverId: null
    };

    for (const field of fields) {
        switch (field.type) {
            case MEMBER_FIELDS.CLIENT_ID:
                member.clientId = field.value.toString('utf8');
                break;

            case MEMBER_FIELDS.NICK:
                member.nick = field.value.toString('utf8');
                break;

            case MEMBER_FIELDS.SERVER_ID:
                member.serverId = field.value.toString('utf8');
                break;

            default:
                break;
        }
    }

    if (!member.clientId || !member.nick || !member.serverId) {
        throw new Error(
            'IRIS CHANNEL_STATE member has missing fields'
        );
    }

    return member;
}

function encodeChannelState({
    channel,
    topic = null,
    state = STATES.ACTIVE,
    ownerServerId = null,
    servers = [],
    members = []
}, messageId, sequence = 0n) {
    if (!channel) {
        throw new Error(
            'IRIS CHANNEL_STATE requires channel'
        );
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRIS CHANNEL_STATE messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.CHANNEL,
            value: channel
        },
        {
            type: FIELDS.STATE,
            value: typeof state === 'object' && state !== null
                ? JSON.stringify(state)
                : state
        }
    ];

    if (topic !== null) {
        fields.push({
            type: FIELDS.TOPIC,
            value: topic
        });
    }

    if (ownerServerId) {
        fields.push({
            type: FIELDS.OWNER_SERVER_ID,
            value: ownerServerId
        });
    }

    for (const serverId of servers) {
        if (serverId) {
            fields.push({
                type: FIELDS.SERVER_ID,
                value: serverId
            });
        }
    }

    for (const member of members) {
        fields.push({
            type: FIELDS.MEMBER,
            value: encodeMember(member)
        });
    }

    console.log('[IRIS DEBUG] CHANNEL_STATE fields:');

    for (const field of fields) {
        console.log({
            type: field.type,
            valueType: typeof field.value,
            isBuffer: Buffer.isBuffer(field.value),
            value: field.value
        });
    }

    console.log('[IRIS DEBUG] CHANNEL_STATE fields:');

for (const field of fields) {
    console.log({
        type: field.type,
        valueType: typeof field.value,
        isBuffer: Buffer.isBuffer(field.value),
        value: field.value
    });
}

    const payload = encodeFields(fields);

    console.log('[IRIS DEBUG] Before encodeFrame:', {
        type: TYPES.CHANNEL_STATE,
        sequence,
        messageIdIsBuffer: Buffer.isBuffer(messageId),
        messageIdLength: messageId?.length,
        payloadIsBuffer: Buffer.isBuffer(payload),
        payloadLength: payload.length
    });

    return encodeFrame({
        type: TYPES.CHANNEL_STATE,
        sequence,
        messageId,
        payload
    });
}

function decodeChannelState(payload) {
    const fields = decodeFields(payload);

    const channelState = {
        channel: null,
        topic: null,
        state: null,
        ownerServerId: null,
        servers: [],
        members: []
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.CHANNEL:
                channelState.channel = field.value.toString('utf8');
                break;

            case FIELDS.TOPIC:
                channelState.topic = field.value.toString('utf8');
                break;

            case FIELDS.STATE: {
                const value = field.value.toString('utf8');

                try {
                    channelState.state = JSON.parse(value);
                } catch {
                    channelState.state = value;
                }

                break;
            }

            case FIELDS.OWNER_SERVER_ID:
                channelState.ownerServerId = field.value.toString('utf8');
                break;

            case FIELDS.SERVER_ID:
                channelState.servers.push(field.value.toString('utf8'));
                break;

            case FIELDS.MEMBER:
                channelState.members.push(decodeMember(field.value));
                break;

            default:
                break;
        }
    }

    if (!channelState.channel) {
        throw new Error(
            'IRIS CHANNEL_STATE missing channel'
        );
    }

    if (channelState.state === null) {
        throw new Error(
            'IRIS CHANNEL_STATE missing state'
        );
    }

    return channelState;
}

module.exports = {
    FIELDS,
    MEMBER_FIELDS,
    STATES,
    encodeMember,
    decodeMember,
    encodeChannelState,
    decodeChannelState
};
