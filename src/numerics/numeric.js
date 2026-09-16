function numeric(
    serverName,
    code,
    nick,
    message = ''
) {
    return `:${serverName} ${code} ${nick || '*'}${
        message ? ` ${message}` : ''
    }`;
}

module.exports = numeric;