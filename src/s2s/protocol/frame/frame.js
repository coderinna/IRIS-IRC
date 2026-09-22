const HEADER_SIZE = 32;

const MAX_PAYLOAD_SIZE = 1024 * 1024;

const TYPES = {
    HELLO: 0x01,
    AUTH: 0x02,
    SERVER: 0x03,
    READY: 0x04,

    CLIENT: 0x10,
    NICK: 0x11,
    JOIN: 0x12,
    PART: 0x13,
    QUIT: 0x14,
    MESSAGE: 0x15,
    NOTICE: 0x16,

    PING: 0x20,
    PONG: 0x21,
    ACK: 0x22
};

const VALID_TYPES = new Set(
    Object.values(TYPES)
);

function encodeFrame({
    version = 1,
    type,
    flags = 0,
    sequence = 0n,
    messageId,
    payload = Buffer.alloc(0)
}) {
    if (
        !Number.isInteger(version) ||
        version < 0 ||
        version > 0xff
    ) {
        throw new TypeError(
            'IRISH frame version must be a uint8'
        );
    }

    if (
        !Number.isInteger(type) ||
        type < 0 ||
        type > 0xff
    ) {
        throw new TypeError(
            'IRISH frame type must be a uint8'
        );
    }

    if (!VALID_TYPES.has(type)) {
        throw new Error(
            `IRISH unknown frame type: 0x${type.toString(16)}`
        );
    }

    if (
        !Number.isInteger(flags) ||
        flags < 0 ||
        flags > 0xffff
    ) {
        throw new TypeError(
            'IRISH frame flags must be a uint16'
        );
    }

    if (
        typeof sequence !== 'bigint' ||
        sequence < 0n ||
        sequence > 0xffffffffffffffffn
    ) {
        throw new TypeError(
            'IRISH frame sequence must be a uint64'
        );
    }

    if (!Buffer.isBuffer(payload)) {
        throw new TypeError(
            'IRISH frame payload must be a Buffer'
        );
    }

    if (payload.length > MAX_PAYLOAD_SIZE) {
        throw new Error(
            'IRISH frame payload exceeds maximum size'
        );
    }

    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH messageId must be a 16-byte Buffer'
        );
    }

    const header = Buffer.alloc(HEADER_SIZE);

    header.writeUInt8(version, 0);
    header.writeUInt8(type, 1);
    header.writeUInt16BE(flags, 2);
    header.writeUInt32BE(payload.length, 4);

    header.writeBigUInt64BE(sequence, 8);

    messageId.copy(header, 16);

    return Buffer.concat([
        header,
        payload
    ]);
}

function decodeHeader(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError(
            'IRISH frame must be a Buffer'
        );
    }

    if (buffer.length < HEADER_SIZE) {
        throw new Error(
            `IRISH frame header requires ${HEADER_SIZE} bytes`
        );
    }

    const version =
        buffer.readUInt8(0);

    const type =
        buffer.readUInt8(1);

    const payloadLength =
        buffer.readUInt32BE(4);

    const sequence =
        buffer.readBigUInt64BE(8);

    if (version !== 1) {
        throw new Error(
            `IRISH unsupported protocol version: ${version}`
        );
    }

    if (!VALID_TYPES.has(type)) {
        throw new Error(
            `IRISH unknown frame type: 0x${type.toString(16)}`
        );
    }

    if (payloadLength > MAX_PAYLOAD_SIZE) {
        throw new Error(
            'IRISH frame payload exceeds maximum size'
        );
    }

    return {
        version,
        type,
        flags: buffer.readUInt16BE(2),
        payloadLength,
        sequence,
        messageId: Buffer.from(
            buffer.subarray(16, 32)
        )
    };
}

module.exports = {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    TYPES,
    VALID_TYPES,
    encodeFrame,
    decodeHeader
};