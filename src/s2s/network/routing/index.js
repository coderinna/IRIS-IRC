// src/s2s/network/routing/route-resolver.js

const getRoute =
    require('./routes/get-route.js');

    const getNextHop =
    require('./routes/get-next-hop.js');

class RouteResolver {
    constructor(manager) {
        this.manager = manager;
    }

getRoute(serverId) {
    return getRoute(
        this,
        serverId
    );
}

getNextHop(serverId) {
    return getNextHop(
        this,
        serverId
    );
}

    hasRoute(serverId) {
        return this.getRoute(serverId) !== null;
    }
}

module.exports = RouteResolver;