// src/s2s/protocol/tlv/encode-field.js

const {
    HEADER_SIZE
} = require('../frame/constants');

function encodeField(type, value) {
    if (
        !Number.isInteger(type) ||
        type < 0 ||
        type > 0xff
    ) {
        throw new TypeError(
            'TLV type must be a uint8'
        );
    }

    if (!Buffer.isBuffer(value)) {
        value = Buffer.from(value, 'utf8');
    }

    if (value.length > 0xffff) {
        throw new RangeError(
            'TLV value is too large'
        );
    }

    const header =
        Buffer.alloc(HEADER_SIZE);

    header.writeUInt8(type, 0);
    header.writeUInt16BE(
        value.length,
        1
    );

    return Buffer.concat([
        header,
        value
    ]);
}

module.exports =
    encodeField;