
'use strict';

const StateMachine = require('../state/state-machine');
const updateVector = require('./operations/updateVector.js');
const createEventOperation = require('./operations/createEvent.js');

class ProtocolNode {
    constructor(serverId, initialEvents = []) {
        this.serverId = serverId;
        this.machine = new StateMachine();
        this.sequence = 0;
        this.vector = new Map();
this.receivedSequences = new Map();
        this.machine.merge(initialEvents);
        this.updateVector(initialEvents);
    }

updateVector(events) {
    const sequence = { value: this.sequence };

    updateVector(
        events,
        this.receivedSequences,
        this.serverId,
        sequence,
        this.vector
    );

    this.sequence = sequence.value;
}

  // Luo uuden tapahtuman ja liittää siihen palvelimen nykyisen tapahtumahistorian.
createEvent(type, actorId, options = {}) {
    const sequence = { value: this.sequence };

    const event = createEventOperation(
        type,
        actorId,
        options,
        this.serverId,
        sequence,
        this.vector
    );

    this.sequence = sequence.value;

    return event;
}

    receive(event) {
        const accepted = this.machine.add(event);
        this.updateVector([event]);

        return accepted;
    }

    getEvents() {
        return this.machine.getOrderedEvents();
    }

    getSnapshot() {
        return this.machine.getSnapshot();
    }
}


module.exports = PartitionSimulator;
