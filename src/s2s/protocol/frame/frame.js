const {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    VALID_TYPES
} = require('./constants.js');

const {
    TYPES
} = require('./types.js');

const decodeHeader =
    require('./decoding/decode-header.js');


const encodeFrame =
    require('./encoding/encode-frame.js');



module.exports = {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    TYPES,
    VALID_TYPES,
    encodeFrame,
    decodeHeader
};