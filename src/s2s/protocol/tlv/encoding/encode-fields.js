
// src/s2s/protocol/tlv/encoding/encode-fields.js

const encodeField =
    require('./encode-field');

function encodeFields(fields) {
    return Buffer.concat(
        fields.map(field =>
            encodeField(
                field.type,
                field.value
            )
        )
    );
}

module.exports =
    encodeFields;