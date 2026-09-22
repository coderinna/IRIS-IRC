
function handleData(connection, chunk) {
    if (
        chunk.length >
        connection.maxChunkSize
    ) {
        console.error(
            `[IRIS] S2S data chunk too large: ${chunk.length} bytes`
        );

        connection.socket.destroy();

        return;
    }

    let frames;

    try {
        frames =
            connection.parser.push(chunk);
    } catch (error) {
        console.error(
            '[IRIS] Parser error:',
            error.message
        );

        connection.socket.destroy();

        return;
    }

    for (const frame of frames) {
        connection.handleFrame(frame);
    }
}


module.exports = 
handleData
;