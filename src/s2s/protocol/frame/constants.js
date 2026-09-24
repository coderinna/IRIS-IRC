
// src/s2s/protocol/frame/constants.js

const {
    TYPES
} = require('./types');

const HEADER_SIZE =
    32;

const MAX_PAYLOAD_SIZE =
    1024 * 1024;

const VALID_TYPES =
    new Set(
        Object.values(TYPES)
    );

module.exports = {
    HEADER_SIZE,
    MAX_PAYLOAD_SIZE
};