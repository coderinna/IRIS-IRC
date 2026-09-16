const {
    TYPES,
    encodeFrame
} = require('../protocol/frame.js');

const {
    encodeFields,
    decodeFields
} = require('../protocol/tlv');

const FIELDS = {
    PROTOCOL_VERSION: 0x01,
    SERVER_ID: 0x02,
    SERVER_NAME: 0x03,
    CAPABILITIES: 0x04
};

function encodeHello({
    protocolVersion = 1,
    serverId,
    serverName,
    capabilities = []
}, messageId) {
    if (!serverId) {
        throw new Error('IRISH HELLO requires serverId');
    }

    if (!serverName) {
        throw new Error('IRISH HELLO requires serverName');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH HELLO messageId must be a 16-byte Buffer'
        );
    }

    const fields = [
        {
            type: FIELDS.PROTOCOL_VERSION,
            value: Buffer.from([protocolVersion])
        },
        {
            type: FIELDS.SERVER_ID,
            value: serverId
        },
        {
            type: FIELDS.SERVER_NAME,
            value: serverName
        }
    ];

    for (const capability of capabilities) {
        fields.push({
            type: FIELDS.CAPABILITIES,
            value: capability
        });
    }

    const payload = encodeFields(fields);

    return encodeFrame({
        type: TYPES.HELLO,
        messageId,
        payload
    });
}

function decodeHello(payload) {
    const fields = decodeFields(payload);

    const hello = {
        protocolVersion: null,
        serverId: null,
        serverName: null,
        capabilities: []
    };

    for (const field of fields) {
        switch (field.type) {
            case FIELDS.PROTOCOL_VERSION:
                if (field.length !== 1) {
                    throw new Error(
                        'Invalid IRISH protocol version'
                    );
                }

                hello.protocolVersion =
                    field.value.readUInt8(0);

                break;

            case FIELDS.SERVER_ID:
                hello.serverId =
                    field.value.toString('utf8');

                break;

            case FIELDS.SERVER_NAME:
                hello.serverName =
                    field.value.toString('utf8');

                break;

            case FIELDS.CAPABILITIES:
                hello.capabilities.push(
                    field.value.toString('utf8')
                );

                break;

            default:
                // Tuntemattomat kentät voidaan myöhemmin
                // jättää yhteensopivuuden vuoksi huomiotta.
                break;
        }
    }

    if (hello.protocolVersion === null) {
        throw new Error(
            'IRISH HELLO missing protocol version'
        );
    }

    if (!hello.serverId) {
        throw new Error(
            'IRISH HELLO missing server ID'
        );
    }

    if (!hello.serverName) {
        throw new Error(
            'IRISH HELLO missing server name'
        );
    }

    return hello;
}

module.exports = {
    FIELDS,
    encodeHello,
    decodeHello
};
