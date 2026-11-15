
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fork } = require('node:child_process');
const path = require('node:path');

const workerPath = path.join(__dirname, 'fixtures', 'tcp-server.js');

let nextCommandId = 1;

function startServer(serverId) {
    const child = fork(workerPath, [serverId], {
        stdio: ['ignore', 'ignore', 'inherit', 'ipc']
    });

    const pending = new Map();
    const workerErrors = [];

    child.on('message', message => {
        if (message.type === 'workerError') {
            workerErrors.push(message.error);
            return;
        }

        if (message.type !== 'result') {
            return;
        }

        const resolve = pending.get(message.id);

        if (resolve) {
            pending.delete(message.id);

            if (message.error) {
                resolve.reject(new Error(message.error));
            } else {
                resolve.resolve(message.result);
            }
        }
    });

    function command(cmd, args = {}) {
        const id = nextCommandId++;

        return new Promise((resolve, reject) => {
            pending.set(id, { resolve, reject });
            child.send({ id, cmd, ...args });
        });
    }

    const ready = new Promise((resolve, reject) => {
        const timeout = setTimeout(
            () => reject(new Error(`${serverId} startup timeout`)),
            5000
        );

        child.on('message', message => {
            if (message.type === 'started') {
                clearTimeout(timeout);
                resolve();
            }
        });

        child.once('exit', code => {
            clearTimeout(timeout);
            reject(new Error(`${serverId} exited during startup: ${code}`));
        });
    });

    return {
        serverId,
        child,
        command,
        ready,
        workerErrors
    };
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitUntil(check, description, timeout = 5000) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        if (await check()) {
            return;
        }

        await delay(25);
    }

    throw new Error(`Timeout waiting for: ${description}`);
}

async function inspect(server) {
    return server.command('inspect');
}

async function waitForEventCount(servers, count) {
    await waitUntil(async () => {
        const states = await Promise.all(servers.map(inspect));

        return states.every(state => state.events.length === count);
    }, `${count} events on all servers`);
}

test(
    'three independent TCP server processes recover after a netsplit',
    { timeout: 20000 },
    async () => {
        const A = startServer('A');
        const B = startServer('B');
        const C = startServer('C');

        const servers = [A, B, C];

        try {
            await Promise.all(servers.map(server => server.ready));

            const [aAddress, bAddress, cAddress] = await Promise.all(
                servers.map(server => server.command('listen'))
            );

            // Topology: A -- B -- C
            await A.command('connect', {
                peerId: 'B',
                port: bAddress.port
            });

            await B.command('connect', {
                peerId: 'C',
                port: cAddress.port
            });

            // Varmistetaan, että alkuperäinen TCP-topologia toimii.
            await waitUntil(async () => {
                const [a, b, c] = await Promise.all(servers.map(inspect));

                return (
                    a.events.length === 0 &&
                    b.events.length === 0 &&
                    c.events.length === 0
                );
            }, 'initial TCP topology');

            // Netsplit: A irtoaa B:stä. B ja C jäävät yhteyteen.
            await A.command('disconnect', { peerId: 'B' });

            await waitUntil(
                () => Promise.resolve(A.child.connected),
                'A process remains alive'
            );

            // Molemmille puolille syntyy itsenäisiä tapahtumia.
            await A.command('create', {
                actorId: 'account-A',
                primaryNick: 'Alice'
            });

            await B.command('create', {
                actorId: 'account-B',
                primaryNick: 'Bob'
            });

            // B:n tapahtuman pitää kulkea C:lle, mutta ei A:lle.
            await waitUntil(async () => {
                const [a, b, c] = await Promise.all(servers.map(inspect));

                return (
                    a.events.length === 1 &&
                    b.events.length === 1 &&
                    c.events.length === 1 &&
                    c.events[0].eventId === 'B:1'
                );
            }, 'partitioned event propagation');

            const isolatedA = await inspect(A);
            const isolatedB = await inspect(B);
            const isolatedC = await inspect(C);

            assert.deepEqual(
                isolatedA.events.map(event => event.eventId),
                ['A:1']
            );

            assert.deepEqual(
                isolatedB.events.map(event => event.eventId),
                ['B:1']
            );

            assert.deepEqual(
                isolatedC.events.map(event => event.eventId),
                ['B:1']
            );

            // Palautetaan A-B TCP-yhteys.
            await A.command('connect', {
                peerId: 'B',
                port: bAddress.port
            });

            // Historianvaihdon pitää palauttaa molemmat tapahtumat kaikkialle.
            await waitForEventCount(servers, 2);

            const [finalA, finalB, finalC] = await Promise.all(
                servers.map(inspect)
            );

            const expectedEvents = ['A:1', 'B:1'];

            for (const state of [finalA, finalB, finalC]) {
                assert.deepEqual(
                    state.events
                        .map(event => event.eventId)
                        .sort(),
                    expectedEvents
                );
            }

            assert.deepEqual(finalA.snapshot, finalB.snapshot);
            assert.deepEqual(finalB.snapshot, finalC.snapshot);

            for (const server of servers) {
                assert.deepEqual(
                    server.workerErrors,
                    [],
                    `${server.serverId} reported worker errors`
                );
            }
        } finally {
            for (const server of servers) {
                if (server.child.connected) {
                    server.child.kill();
                }
            }
        }
    }
);


test(
    'TCP recovery requests only the missing sequence from a history gap',
    { timeout: 20000 },
    async () => {
        const A = startServer('A-gap');
        const B = startServer('B-gap');
        const C = startServer('C-gap');

        const servers = [A, B, C];

        try {
            await Promise.all(servers.map(server => server.ready));

            const [, bAddress, cAddress] = await Promise.all(
                servers.map(server => server.command('listen'))
            );

            // Topology: A -- B -- C
            await A.command('connect', {
                peerId: 'B-gap',
                port: bAddress.port
            });

            await B.command('connect', {
                peerId: 'C-gap',
                port: cAddress.port
            });

            // Katkaistaan A-B-yhteys.
            await A.command('disconnect', { peerId: 'B-gap' });

            // B luo kolme peräkkäistä tapahtumaa.
            const first = await B.command('create', {
                actorId: 'account-1',
                primaryNick: 'Alice'
            });

            const second = await B.command('create', {
                actorId: 'account-2',
                primaryNick: 'Bob'
            });

            const third = await B.command('create', {
                actorId: 'account-3',
                primaryNick: 'Carol'
            });

            const events = [
                first.event,
                second.event,
                third.event
            ];

            assert.deepEqual(
                events.map(event => event.sequence),
                [1, 2, 3]
            );

            // B:n ja C:n pitää tuntea koko historia.
            await waitUntil(async () => {
                const [b, c] = await Promise.all([
                    inspect(B),
                    inspect(C)
                ]);

                return b.events.length === 3 && c.events.length === 3;
            }, 'B and C receive all three events');

            // A saa vain sekvenssit 1 ja 3.
            await A.command('inject', { event: events[0] });
            await A.command('inject', { event: events[2] });

            const beforeRecovery = await inspect(A);

            assert.deepEqual(
                beforeRecovery.events
                    .map(event => event.sequence)
                    .sort((a, b) => a - b),
                [1, 3]
            );

            // Palautetaan yhteys. A:n pitää havaita puuttuva sekvenssi 2.
            await A.command('connect', {
                peerId: 'B-gap',
                port: bAddress.port
            });

            await waitForEventCount(servers, 3);

            const [finalA, finalB, finalC] = await Promise.all(
                servers.map(inspect)
            );

            for (const state of [finalA, finalB, finalC]) {
                const bSequences = state.events
                    .filter(event => event.serverId === 'B-gap')
                    .map(event => event.sequence)
                    .sort((a, b) => a - b);

                assert.deepEqual(bSequences, [1, 2, 3]);
            }

            assert.deepEqual(finalA.snapshot, finalB.snapshot);
            assert.deepEqual(finalB.snapshot, finalC.snapshot);

            for (const server of servers) {
                assert.deepEqual(
                    server.workerErrors,
                    [],
                    `${server.serverId} reported worker errors`
                );
            }
        } finally {
            for (const server of servers) {
                if (server.child.connected) {
                    server.child.kill();
                }
            }
        }
    }
);

