// src/s2s/manager/handlers/setupEvents.js

const events = require('../../../events');

const handleMode = require('./mode');
const handleClient = require('./client');
const handleNick = require('./nick');
const handleJoin = require('./join');
const handlePart = require('./part');
const handleQuit = require('./quit');
const handleMessage = require('./message');
const handleTopic = require('./topic');
const handleNotice =
    require('./notice');

module.exports = function setupEvents(connection) {

    events.on(
        'client:registered',
        ({ client }) => {
            handleClient(
                connection,
                client
            );
        }
    );

    events.on(
        'client:nick_changed',
        ({ client, oldNick, newNick }) => {
            handleNick(
                connection,
                client,
                oldNick,
                newNick
            );
        }
    );

    events.on(
        'channel:joined',
        ({ client, channel }) => {
            handleJoin(
                connection,
                client,
                channel
            );
        }
    );

    events.on(
        'channel:parted',
        ({ client, channel, reason }) => {
            handlePart(
                connection,
                client,
                channel,
                reason
            );
        }
    );

    events.on(
        'client:quit',
        ({ client, reason }) => {
            handleQuit(
                connection,
                client,
                reason
            );
        }
    );

events.on(
    'message:sent',
    ({ client, target, message, type }) => {
        console.log(
            '[IRIS DEBUG] setupEvents received message:sent'
        );

        console.log(
            '[IRIS DEBUG] type:',
            type
        );

        if (type === 'notice') {
            handleNotice(
                connection,
                client,
                target,
                message
            );

            return;
        }

        handleMessage(
            connection,
            client,
            target,
            message
        );
    }
);

events.on(
    'channel:mode',
    ({ client, channel, mode, targetNick, modeParam }) => {
        handleMode(
            connection,
            client,
            channel,
            mode,
            targetNick,
            modeParam
        );
    }
);

    events.on(
    'channel:topic',
    ({ client, channel, topic }) => {
        handleTopic(
            connection,
            client,
            channel,
            topic
        );
    }
);
};