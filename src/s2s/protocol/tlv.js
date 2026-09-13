const HEADER_SIZE = 3;

function encodeField(type, value) {
    if (!Number.isInteger(type) || type < 0 || type > 0xff) {
        throw new TypeError('TLV type must be a uint8');
    }

    if (!Buffer.isBuffer(value)) {
        value = Buffer.from(value, 'utf8');
    }

    if (value.length > 0xffff) {
        throw new RangeError('TLV value is too large');
    }

    const header = Buffer.alloc(HEADER_SIZE);

    header.writeUInt8(type, 0);
    header.writeUInt16BE(value.length, 1);

    return Buffer.concat([
        header,
        value
    ]);
}

function encodeFields(fields) {
    return Buffer.concat(
        fields.map(field =>
            encodeField(field.type, field.value)
        )
    );
}

function decodeFields(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError('TLV input must be a Buffer');
    }

    const fields = [];
    let offset = 0;

    while (offset < buffer.length) {
        if (buffer.length - offset < HEADER_SIZE) {
            throw new Error('Incomplete TLV header');
        }

        const type = buffer.readUInt8(offset);
        const length = buffer.readUInt16BE(offset + 1);

        offset += HEADER_SIZE;

        if (buffer.length - offset < length) {
            throw new Error('Incomplete TLV value');
        }

        const value = Buffer.from(
            buffer.subarray(
                offset,
                offset + length
            )
        );

        fields.push({
            type,
            length,
            value
        });

        offset += length;
    }

    return fields;
}

module.exports = {
    encodeField,
    encodeFields,
    decodeFields
};
