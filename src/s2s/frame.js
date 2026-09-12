const HEADER_SIZE = 24;

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

function encodeFrame({
    version = 1,
    type,
    flags = 0,
    messageId,
    payload = Buffer.alloc(0)
}) {
    if (!Number.isInteger(type) || type < 0 || type > 0xff) {
        throw new TypeError('IRISH frame type must be a uint8');
    }

    if (!Number.isInteger(flags) || flags < 0 || flags > 0xffff) {
        throw new TypeError('IRISH frame flags must be a uint16');
    }

    if (!Buffer.isBuffer(payload)) {
        throw new TypeError('IRISH frame payload must be a Buffer');
    }

    if (!Buffer.isBuffer(messageId) || messageId.length !== 16) {
        throw new TypeError(
            'IRISH messageId must be a 16-byte Buffer'
        );
    }

    const header = Buffer.alloc(HEADER_SIZE);

    header.writeUInt8(version, 0);
    header.writeUInt8(type, 1);
    header.writeUInt16BE(flags, 2);
    header.writeUInt32BE(payload.length, 4);

    messageId.copy(header, 8);

    return Buffer.concat([
        header,
        payload
    ]);
}

function decodeHeader(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError('IRISH frame must be a Buffer');
    }

    if (buffer.length < HEADER_SIZE) {
        throw new Error(
            `IRISH frame header requires ${HEADER_SIZE} bytes`
        );
    }

    return {
        version: buffer.readUInt8(0),
        type: buffer.readUInt8(1),
        flags: buffer.readUInt16BE(2),
        payloadLength: buffer.readUInt32BE(4),
        messageId: Buffer.from(
            buffer.subarray(8, 24)
        )
    };
}

module.exports = {
    HEADER_SIZE,
    TYPES,
    encodeFrame,
    decodeHeader
};