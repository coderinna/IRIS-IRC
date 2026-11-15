const TrustRegistry =
    require('./trust-registry');

const {
    createNetworkPolicy,
    DEFAULT_NETWORK_POLICY
} = require('./policies/network-policy');

const {
    createServerPolicy,
    DEFAULT_SERVER_POLICY
} = require('./policies/server-policy');

const authenticateServer =
    require('./authentication/authenticate-server');

const authorizeServer =
    require('./authorization/authorize-server');


const authorizeAction =
    require('./authorization/authorize-action');

module.exports = {
    TrustRegistry,

    createNetworkPolicy,
    DEFAULT_NETWORK_POLICY,

    createServerPolicy,
    DEFAULT_SERVER_POLICY,

    authenticateServer,
    authorizeServer,

    authorizeAction
};