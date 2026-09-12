function parseLine(line) {
    const match = line.match(
        /^(?:@[^ ]+ )?(?::([^ ]+) )?([^ ]+)(?: (.*))?$/
    );

    if (!match) {
        return null;
    }

    const prefix = match[1] || null;
    const command = match[2].toUpperCase();
    const rest = match[3] || '';

    let params = [];
    let trailing = null;

    const trailingIndex = rest.indexOf(' :');

    if (trailingIndex !== -1) {
        const before = rest.slice(0, trailingIndex);

        trailing = rest.slice(trailingIndex + 2);

        params = before
            ? before.split(' ')
            : [];
    } else if (rest.startsWith(':')) {
        trailing = rest.slice(1);
    } else {
        params = rest
            ? rest.split(' ')
            : [];
    }

    return {
        prefix,
        command,
        params,
        trailing
    };
}

module.exports = {
    parseLine
};