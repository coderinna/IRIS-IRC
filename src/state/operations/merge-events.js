
'use strict';

function merge(events) {
    if (!Array.isArray(events)) {
        throw new Error('Events must be an array');
    }

    for (const event of events) {
        this.validateEvent(event);
    }

    let accepted = 0;
    let duplicates = 0;

    for (const event of events) {
        if (this.add(event)) {
            accepted++;
        } else {
            duplicates++;
        }
    }

    return { accepted, duplicates };
}

module.exports = merge;
