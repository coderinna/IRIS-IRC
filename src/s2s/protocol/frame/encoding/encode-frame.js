
// src/s2s/protocol/frame/encoding/encode-frame.js

const {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    VALID_TYPES
} = require('../constants.js');

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
            'IRIS frame version must be a uint8'
        );
    }

    if (
        !Number.isInteger(type) ||
        type < 0 ||
        type > 0xff
    ) {
        throw new TypeError(
            'IRIS frame type must be a uint8'
        );
    }

    if (!VALID_TYPES.has(type)) {
        throw new Error(
            `IRIS unknown frame type: 0x${type.toString(16)}`
        );
    }

    if (
        !Number.isInteger(flags) ||
        flags < 0 ||
        flags > 0xffff
    ) {
        throw new TypeError(
            'IRIS frame flags must be a uint16'
        );
    }

    if (
        typeof sequence !== 'bigint' ||
        sequence < 0n ||
        sequence > 0xffffffffffffffffn
    ) {
        throw new TypeError(
            'IRIS frame sequence must be a uint64'
        );
    }

    if (!Buffer.isBuffer(payload)) {
        throw new TypeError(
            'IRIS frame payload must be a Buffer'
        );
    }

    if (payload.length > MAX_PAYLOAD_SIZE) {
        throw new Error(
            'IRIS frame payload exceeds maximum size'
        );
    }

    if (
        !Buffer.isBuffer(messageId) ||
        messageId.length !== 16
    ) {
        throw new TypeError(
            'IRIS messageId must be a 16-byte Buffer'
        );
    }

    const header =
        Buffer.alloc(HEADER_SIZE);

    header.writeUInt8(
        version,
        0
    );

    header.writeUInt8(
        type,
        1
    );

    header.writeUInt16BE(
        flags,
        2
    );

    header.writeUInt32BE(
        payload.length,
        4
    );

    header.writeBigUInt64BE(
        sequence,
        8
    );

    messageId.copy(
        header,
        16
    );

    return Buffer.concat([
        header,
        payload
    ]);
}

module.exports =
    encodeFrame;