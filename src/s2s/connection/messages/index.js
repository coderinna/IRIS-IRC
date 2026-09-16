const crypto = require('crypto');

const {
    encodeHello
} = require('../../messages/hello');

const {
    encodeAuth
} = require('../../messages/auth');

const {
    encodeServer
} = require('../../messages/server');

const {
    encodeReady
} = require('../../messages/ready');

const {
    encodeAck
} = require('../../messages/ack');

const sendHello = connection => {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame = encodeHello({
        protocolVersion: 1,
        serverId: connection.serverId,
        serverName: connection.serverName,
        capabilities: connection.capabilities
    }, messageId, sequence);

   return connection.sendFrame(frame);


};

const sendAuth = connection => {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame = encodeAuth({
        method: 'token',
        serverId: connection.serverId,
        token: connection.authToken
    }, messageId, sequence);

  return connection.sendFrame(frame);

};

const sendServer = connection => {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame = encodeServer({
        serverId: connection.serverId,
        serverName: connection.serverName,
        serverVersion: connection.serverVersion,
        serverRole: connection.serverRole
    }, messageId, sequence);

return connection.sendFrame(frame);

};

const sendReady = connection => {
    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame = encodeReady({
        serverId: connection.serverId,
        status: 'ready'
    }, messageId, sequence);

    return connection.sendFrame(frame);

};

const sendAck = (
    connection,
    acknowledgedMessageId
) => {
    if (
        !Buffer.isBuffer(
            acknowledgedMessageId
        ) ||
        acknowledgedMessageId.length !== 16
    ) {
        throw new TypeError(
            'IRISH ACK acknowledgedMessageId must be a 16-byte Buffer'
        );
    }

    const messageId =
        crypto.randomBytes(16);

    const sequence =
        connection.nextSendSequence();

    const frame =
        encodeAck(
            acknowledgedMessageId,
            messageId,
            sequence
        );

    return connection.sendFrame(frame);
};

module.exports = {
    sendHello,
    sendAuth,
    sendServer,
    sendReady,
    sendAck
};