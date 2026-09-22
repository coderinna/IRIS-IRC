const HEADER_SIZE = 3;

const MAX_FIELDS = 256;
const MAX_BUFFER_SIZE = 1024 * 1024;

function decodeFields(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError('TLV input must be a Buffer');
    }

        if (buffer.length > MAX_BUFFER_SIZE) {
        throw new RangeError(
            'TLV input is too large'
        );
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

        if (fields.length >= MAX_FIELDS) {
    throw new RangeError(
        'Too many TLV fields'
    );
}

        fields.push({
            type,
            length,
            value
        });

        offset += length;
    }

    return fields;
}


module.exports =
    decodeFields;