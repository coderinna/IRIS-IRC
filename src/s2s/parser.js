const {
    HEADER_SIZE,
    decodeHeader
} = require('./frame');

class FrameParser {
    constructor() {
        this.buffer = Buffer.alloc(0);
    }

    push(chunk) {
        if (!Buffer.isBuffer(chunk)) {
            throw new TypeError(
                'IRISH parser input must be a Buffer'
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