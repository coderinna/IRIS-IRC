
'use strict';

function getSnapshot() {
    const accounts = {};

    for (const [id, account] of [...this.state.accounts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))) {
        accounts[id] = structuredClone(account);
    }

    const sessions = Object.fromEntries(
        [...this.state.sessions.entries()].sort(([a], [b]) =>
            a.localeCompare(b)
        )
    );

    const channels = {};

    for (const name of [...this.state.channels.keys()].sort()) {
        channels[name] = this.getChannel(name);
    }

    return { accounts, sessions, channels };
}

module.exports = getSnapshot;
