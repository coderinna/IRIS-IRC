
'use strict';

function createAcceptEvent({ eventLog, machine, sendToPeers }) {
    return function acceptEvent(event, sourceSocket = null) {
        const accepted = eventLog.add(event);

        if (!accepted) {
            return false;
        }

        machine.add(event);

        sendToPeers({
            type: 'EVENT',
            event
        }, sourceSocket);

        return true;
    };
}

module.exports = createAcceptEvent;
