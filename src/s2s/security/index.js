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

const authorizeOutbound =
    require('./authorization/authorize-outbound.js');
const authorizeAction =
    require('./authorization/authorize-action');

const validateServerIdentity =
    require('./validation/validate-server-identity');

const validateServerIntroduction =
    require('./validation/validate-server-introduction');

module.exports = {
    TrustRegistry,

    createNetworkPolicy,
    DEFAULT_NETWORK_POLICY,

    createServerPolicy,
    DEFAULT_SERVER_POLICY,

    authenticateServer,
    authorizeServer,
    authorizeOutbound,

    authorizeAction,
    validateServerIdentity,
    validateServerIntroduction
};