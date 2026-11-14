const TrustRegistry =
    require('./trust-registry');

const {
    createNetworkPolicy,
    DEFAULT_NETWORK_POLICY
} = require('./network-policy');

const {
    createServerPolicy,
    DEFAULT_SERVER_POLICY
} = require('./server-policy');

const authenticateServer =
    require('./authenticate-server');

const authorizeServer =
    require('./authorize-server');

module.exports = {
    TrustRegistry,

    createNetworkPolicy,
    DEFAULT_NETWORK_POLICY,

    createServerPolicy,
    DEFAULT_SERVER_POLICY,

    authenticateServer,
    authorizeServer
};