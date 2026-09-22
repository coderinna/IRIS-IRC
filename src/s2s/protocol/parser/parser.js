const {
    HEADER_SIZE,
    decodeHeader
} = require('../frame/frame.js');

class FrameParser {
    constructor(options = {}) {
        this.maxBufferSize =
            options.maxBufferSize || 1024 * 1024;

        this.buffer = Buffer.alloc(0);
    }

    push(chunk) {
        if (!Buffer.isBuffer(chunk)) {
            throw new TypeError(
                'IRISH parser input must be a Buffer'
            );
        }

        if (
            this.buffer.length + chunk.length >
            this.maxBufferSize
        ) {
            throw new Error(
                'IRISH parser buffer limit exceeded'
            );
        }

        this.buffer = Buffer.concat([
            this.buffer,
            chunk
        ]);

        const frames = [];

        while (true) {
            // Header ei ole vielä kokonaan saapunut
            if (this.buffer.length < HEADER_SIZE) {
                break;
            }

            const header = decodeHeader(this.buffer);

            const frameSize =
                HEADER_SIZE + header.payloadLength;

            // Frame olisi liian suuri
            if (frameSize > this.maxBufferSize) {
                throw new Error(
                    'IRISH frame exceeds parser buffer limit'
                );
            }

            // Koko frame ei ole vielä saapunut
            if (this.buffer.length < frameSize) {
                break;
            }

            const payload = Buffer.from(
                this.buffer.subarray(
                    HEADER_SIZE,
                    frameSize
                )
            );

frames.push({
    version: header.version,
    type: header.type,
    flags: header.flags,
    sequence: header.sequence,
    messageId: header.messageId,
    payload
});

            // Poista käsitelty frame bufferista
            this.buffer = this.buffer.subarray(
                frameSize
            );
        }

        return frames;
    }

    getBufferedBytes() {
        return this.buffer.length;
    }

    reset() {
        this.buffer = Buffer.alloc(0);
    }
}

module.exports = FrameParser;