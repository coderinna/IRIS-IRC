const DEFAULT_SERVER_POLICY = {
    // Vaaditaanko TLS myös paikallisesti
    requireTLS: false,

    // Palvelimen vaatimat lisäominaisuudet
    requiredCapabilities: [],

    // Sallitaanko vain tietyt palvelinroolit
    allowedServerRoles: [],

    // Vähimmäisvaatimus etäpalvelimen versiolle
    minimumServerVersion: null,

    // Sallitaanko uusien palvelinten esittely verkkoon
    allowServerIntroduction: true,

    // Sallitaanko reititys tämän palvelimen kautta
    allowRouting: true,

    // Sallitaanko asiakkaiden ja kanavien synkronointi
    allowSynchronization: true
};

function createServerPolicy(options = {}) {
    return {
        ...DEFAULT_SERVER_POLICY,
        ...options,

        requiredCapabilities: [
            ...(options.requiredCapabilities || [])
        ],

        allowedServerRoles: [
            ...(options.allowedServerRoles || [])
        ]
    };
}

module.exports = {
    DEFAULT_SERVER_POLICY,
    createServerPolicy
};