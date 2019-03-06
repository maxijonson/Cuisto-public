function MakeError(message) {
    return {message}
}

module.exports = {
    // NOT FOUND
    INSTANCE_NOT_FOUND: MakeError("Aucune instance de la ressource que vous avez demandé n'existe"),
    RESTO_NOT_FOUND: MakeError("Restaurant inexistant ou ne vous appartient pas"),
    POSTE_NOT_FOUND: MakeError("Poste inexistant ou ne vous appartient pas"),
    SESSION_RID_NOT_FOUND: MakeError("Impossible d'acquerir le restaurant dans lequel vous opérez"),
    SESSION_NOT_FOUND: MakeError("Une erreur est survenue lors de l'acquisition de votre session"),
    SESSION_USER_NOT_FOUND: MakeError("Impossible d'acquerir l'usager de votre session"),
    ARTICLE_FOURNISSEUR_NOT_FOUND: MakeError("Ce fournisseur ne fais pas partie des fournisseurs de l'article"),
    TOKEN_NOT_FOUND: MakeError("Le 'token' passé à la requête ne semble pas être associé à un compte"),
    // BAD REQUEST
    BAD_REQUEST_DEFAULT: MakeError("Requête invalide. Vérifiez que toute information nécessaire est envoyée"),
    MISSING_CREDENTIALS: MakeError("Vous devez spécifier un courriel ou un nom d'utilisateur"),
    TOKEN_NOT_STRING: MakeError("Le 'token' passé à la requête est d'un type invalide"),
    // AUTH 
    UNAUTHORIZED: MakeError("Votre type de compte n'est pas autorisé à faire cette opération"),
    FORBIDDEN: MakeError("Vous n'êtes pas autorisés à accéder à cette resource"),
    INVALID_CREDENTIALS: MakeError("Le nom d'usager ou le mot de passe est erroné"),
    INVALID_PASSWORD: MakeError("Le mot de passe est invalide"),
    SESSION_INVALIDATED: MakeError("Vous avez été déconnecté"),
    INVALID_TOKEN_ACCESS: MakeError("Votre accès n'est pas autorisé à faire ce type d'opération"),
    UNKNOWN_TOKEN_ACCESS: MakeError("Votre type d'accès n'a pas été reconnu. Essayez de vous reconnecter."),
    // INTERNAL
    INTERNAL: MakeError("Une erreur interne dans le serveur est survenue"),
    DATABASE_FULL: MakeError("Impossible d'opérer sur la base de données, elle est probablement pleine!"),
    // CONFLICT
    EMPLOYEE_ALREADY_EXISTS: MakeError("Un employé avec ce nom d'usager ou courriel existe déjà"),
    ORGANISATION_ALREADY_EXISTS: MakeError("Une organisation existe déjà avec ce nom d'usager ou courriel"),
    // OTHER
    FINDBYTOKEN_ERROR: MakeError("Une erreur s'est produite lors du traitement du 'token' de votre requête"),
    CUSTOM: (message) => MakeError(message)
}