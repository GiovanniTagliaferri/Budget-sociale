import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import ProposteDAO from './dao/DaoProposte.mjs';
import UtentiDAO from './dao/DaoUtenti.mjs';
import FaseDAO from './dao/DaoFase.mjs';
import BudgetDAO from './dao/DaoBudget.mjs';
import PreferenzeDAO from './dao/DaoPreferenze.mjs';
import {check, validationResult} from 'express-validator';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { PropostaNotFoundError, AuthenticationError, PreferenzaAlreadyExistsError, PreferenzaNotFoundError, BudgetAlreadyExistsError, BudgetNotFoundError, FaseAlreadyExistsError, FaseNotFoundError, UtenteNotFoundError } from './errori.mjs';
import dayjs from 'dayjs';

// importo funzioni dalle dao
const proposteDAO = new ProposteDAO();
const utentiDAO = new UtentiDAO();
const faseDAO = new FaseDAO();
const budgetDAO = new BudgetDAO();
const preferenzeDAO = new PreferenzeDAO();

// inizializzazione del server
const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));

// abilito CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

// PASSPORT
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const utente = await utentiDAO.getUtenteDaCredenziali(username, password);
    if(utente) {
        return callback(null, utente);
    } else {
        return callback(null, false, "Credenziali errate");
    }
}));

passport.serializeUser(function(utente, callback) {
    callback(null, utente);
});

passport.deserializeUser(function(utente, callback) {
    callback(null, utente);
});

// CREO LA SESSIONE
app.use(session({
    secret: "Inizializzazione della sessione",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// verifica che un utente sia autenticato
const isLoggedIn= (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).send("Non sei autenticato.");
    }
}

// verifica che un utente sia un 'ammministratore'
const isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.ruolo === 'amministratore') {
        return next();
    } else {
        res.status(401).send("Non sei autorizzato");
    }
};

const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({validationErrors: errors.mapped()});
};

const errorFormatter = ({msg}) => {
    return msg;
};

// FUNZIONI DI VALIDAZIONE
const faseValidation = [
    check('valore').isNumeric().notEmpty()
];

const budgetValidation = [
    check('valore').isNumeric().notEmpty()
];

const propostaValidation = [
    check('descrizione').isString().notEmpty(),
    check('costo').isNumeric().notEmpty(),
    check('data').isDate().notEmpty(),
    check('idUtente').isNumeric().notEmpty(),
    check('approvata').isString().notEmpty(),
    check('punteggio').isNumeric()
];

const preferenzaValidation = [
    check('valore').isNumeric().notEmpty()
];

// ROUTES
// login utente
app.post('/api/sessioni', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.status(401).json({error: info}); // user non autenticato e mostro l'errore
        }

        // user autenticato e lo salvo nella sessione
        req.login(user, (err) => {
            if(err) return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

// ottengo la sessione corrente
app.get('/api/sessioni/corrente', (req, res) => {
    if(req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json(new AuthenticationError());
    }
});

// logout utente
app.delete('/api/sessioni/corrente', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// ottengo lista di {id, username} di tutti gli utenti
app.get('/api/utenti', async (req, res) => {
    try {
        const utenti = await utentiDAO.getUtenti();
        res.status(200).json(utenti);
    } catch(err) {
        res.status(500).json(err);
    }
});

// BUDGET API
// creazione budget
app.post('/api/budget', isAdmin, budgetValidation, async (req, res) => {
    const invalidFields = validationResult(req);
    if(!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }

    try {
        const budget = req.body;
        const newBudget = await budgetDAO.createBudget(budget);
        res.status(201).json(newBudget);
    }
    catch(err) {
        if(err instanceof BudgetAlreadyExistsError) {
            res.status(503).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// ottengo il budget corrente
app.get('/api/budget', isLoggedIn, async (req, res) => {
    try {
        const budget = await budgetDAO.getBudget();
        res.status(200).json(budget);
    }
    catch(err) {
        if(err instanceof BudgetNotFoundError) {
            res.status(503).send(err.message);
        } else {
            res.status(500).json(err);
        };
    }
});

// cancella il budget
app.delete('/api/budget', isAdmin, (req, res) => {
    budgetDAO.deleteBudget()
    .then(() => {
        res.status(200).end();
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});


// FASE API
// inizializza la fase a 0
app.post('/api/fase', isLoggedIn, async (req, res) => {
    try {
        const newFase = await faseDAO.createFase();
        res.status(201).json(newFase);
    }
    catch(err) {
        if(err instanceof FaseAlreadyExistsError) {
            res.status(503).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// ottieni la fase corrente
app.get('/api/fase', async (req, res) => {
    try {
        const fase = await faseDAO.getFase();
        res.status(200).json(fase);
    }
    catch(err) {
        if(err instanceof FaseNotFoundError) {
            res.status(503).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// cancella fase
app.delete('/api/fase', isAdmin, (req, res) => {
    faseDAO.deleteFase()
    .then(() => {
        res.status(200).end();
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});

// cambia la fase corrente
app.put('/api/fase', isAdmin, faseValidation, (req, res) => {
    const invalidFields = validationResult(req);
    if(!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }

    faseDAO.editFase(req.body.valore)
    .then(() => {
        res.status(200).end();
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});

// PROPOSTE API
// creazione proposta
app.post('/api/proposte', isLoggedIn, propostaValidation, async (req, res) => {
    const proposta = req.body;
    const newData = dayjs(proposta.data).format('YYYY-MM-DD');
    proposta.data = newData;

    const invalidFields = validationResult(proposta);
    if (!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }

    try {
        const result = await proposteDAO.createProposta(proposta);
        res.status(201).json(result);
    } catch(err) {
        res.status(503).json(err);
    }
});

// ottengo tutte le proposte
app.get('/api/proposte', (req, res) => {
    proposteDAO.getProposte()
    .then((proposte) => {
        res.status(200).json(proposte);
    })
    .catch((err) => {
        res.status(500).json(err);
    });
});

// ottengo una proposta dato l'id
app.get('/api/proposte/:id', isLoggedIn, async (req, res) => {
    try {
        const proposta = await proposteDAO.getProposta(req.params.id, req.user.id);
        res.status(200).json(proposta);
    } catch(err) {
        if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// ottengo tutte le proposte di un utente
app.get('/api/utenti/:id/proposte', isLoggedIn, async (req, res) => {
    try {
        const proposte = await proposteDAO.getProposteUtente(req.user.id);
        res.status(200).json(proposte);
    } catch(err) {
        if(err instanceof UtenteNotFoundError) {
            res.status(404).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// modifica una proposta
app.put('/api/proposte/:id', isLoggedIn, propostaValidation, async (req, res) => {
    const proposta = req.body;
    const newData = dayjs(proposta.data).format('YYYY-MM-DD');
    proposta.data = newData;

    const invalidFields = validationResult(proposta);
    if(!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }
    console.log(proposta);
    try {
        await proposteDAO.editProposta(proposta);
        res.status(200).end();
    }
    catch(err) {
        if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// l'utente cancella una sua proposta
app.delete('/api/proposte/:id', isLoggedIn, async (req, res) => {
    try {
        await proposteDAO.deleteProposta(req.params.id, req.user.id);
        res.status(200).end();
    } catch(err) {
        if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// cancella tutte le proposte
app.delete('/api/proposte', isAdmin, async (req, res) => {
    try {
        await proposteDAO.deleteAllProposte();
        res.status(200).end();
    } catch(err) {
        res.status(500).json(err);
    }
});

// PREFERENZE API
// user idUser esprime preferenza per proposta specificata
app.post('/api/proposte/:id/preferenze', isLoggedIn, preferenzaValidation, async (req, res) => {
    const invalidFields = validationResult(req);
    if(!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }
    try {
        const preferenza = req.body;    // {"id": undefined, "idProposta": undefined, "idUtente": undefiend, "valore": <intero>}
        preferenza.idUtente = req.user.id;
        preferenza.idProposta = req.params.id;
        const newPreferenza = await preferenzeDAO.createPreferenza(preferenza);
        res.status(201).json(newPreferenza);
    } catch(err) {
        if(err instanceof PreferenzaAlreadyExistsError) {
            res.status(503).send(err.message);
        } else if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        }
        else {
            res.status(500).json(err);
        }
    }
});

// l'utente cancella la sua preferenza per una proposta
app.delete('/api/proposte/:id/preferenze', isLoggedIn, async (req, res) => {
    try {
        await preferenzeDAO.deletePreferenza(req.params.id, req.user.id);
        res.status(200).end();
    } catch(err) {
        if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        } else if(err instanceof PreferenzaNotFoundError) {
            res.status(503).json(err);
        } else {
            res.status(500).json(err);
        }
    }
});

// cambia il valore di una preferenza esistente
app.put('/api/proposte/:id/preferenze', isLoggedIn, preferenzaValidation, async (req, res) => {
    const invalidFields = validationResult(req);
    if(!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }
    try {
        const preferenza = req.body;
        await preferenzeDAO.editPreferenza(preferenza);
        res.status(200).end();
    } catch(err) {
        if(err instanceof PreferenzaNotFoundError) {
            res.status(503).send(err.message);
        } else if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        }
        else {
            res.status(500).json(err);
        }
    }
});

// ottengo le preferenze di una proposta
app.get('/api/proposte/:id/preferenze', isLoggedIn, async (req, res) => {
    try {
        const preferenze = await preferenzeDAO.getPreferenzeProposta(req.params.id);
        res.status(200).json(preferenze);
    } catch(err) {
        if(err instanceof PropostaNotFoundError) {
            res.status(404).send(err.message);
        } else {
            res.status(500).json(err);
        }
    }
});

// ottengo tutte le preferenze di tutte le proposte
app.get('/api/preferenze', async (req, res) => {
    try {
        const preferenze = await preferenzeDAO.getListaPreferenze();
        res.status(200).json(preferenze);
    } catch(err) {
        res.status(500).json(err);
    }
});

// cancella tutte le preferenze
app.delete('/api/preferenze', isAdmin, async (req, res) => {
    try {
        await preferenzeDAO.deleteAllPreferenze();
        res.status(200).end();
    } catch(err) {
        res.status(500).json(err);
    }
});


// run server
app.listen(port, () => console.log(`API server started on port http://localhost:${port}/api/`));