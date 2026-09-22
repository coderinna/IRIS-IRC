
// src/s2s/protocol/frame/decoding/decode-header.js
const {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    VALID_TYPES
} = require('../constants.js');


function decodeHeader(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError(
            'IRIS frame must be a Buffer'
        );
    }

    if (buffer.length < HEADER_SIZE) {
        throw new Error(
            `IRIS frame header requires ${HEADER_SIZE} bytes`
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
            `IRIS unsupported protocol version: ${version}`
        );
    }

    if (!VALID_TYPES.has(type)) {
        throw new Error(
            `IRIS unknown frame type: 0x${type.toString(16)}`
        );
    }

    if (payloadLength > MAX_PAYLOAD_SIZE) {
        throw new Error(
            'IRIS frame payload exceeds maximum size'
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

module.exports =
    decodeHeader;