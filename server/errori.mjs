export class PropostaNotFoundError extends Error {
    constructor(message = "Proposta non trovata") {
        super(message); // Chiama il costruttore della classe base (Error) con il messaggio
        this.name = this.constructor.name; // Imposta il nome dell'errore come nome della classe
        Error.captureStackTrace(this, this.constructor); // Cattura lo stack trace per questo errore
    }
}

export class AuthenticationError extends Error {
    constructor(message = "Autenticazione fallita") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class PreferenzaAlreadyExistsError extends Error {
    constructor(message = "Hai già espresso una preferenza su questa proposta") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class PreferenzaNotFoundError extends Error {
    constructor(message = "Preferenza non trovata") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BudgetAlreadyExistsError extends Error {
    constructor(message = "Budget già esistente") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BudgetNotFoundError extends Error {
    constructor(message = "Budget non trovato") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class FaseNotFoundError extends Error {
    constructor(message = "Fase non trovata") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class FaseAlreadyExistsError extends Error {
    constructor(message = "Fase già esistente") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UtenteNotFoundError extends Error {
    constructor(message = "Utente non trovato") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}