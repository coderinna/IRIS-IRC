// Tämä estää palvelinta vaihtamasta identiteettiään HELLO- ja SERVER-vaiheiden välillä.

module.exports = function validateServerIdentity({
    hello,
    server
}) {
    if (!hello || !server) {
        return {
            valid: false,
            reason: 'IDENTITY_DATA_MISSING'
        };
    }

    if (hello.serverId !== server.serverId) {
        return {
            valid: false,
            reason: 'SERVER_ID_MISMATCH'
        };
    }

    if (hello.serverName !== server.serverName) {
        return {
            valid: false,
            reason: 'SERVER_NAME_MISMATCH'
        };
    }

    return {
        valid: true,
        serverId: server.serverId,
        serverName: server.serverName
    };
};
