import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';

// import components
import NavHeader from './components/NavHeaderComponent';
import NotAuthorized from './NotAuthorizedComponent';
import FormBudget from './components/FormBudgetComponent';
import UserConsole from './components/UserConsoleComponent';
import FormProposta from './components/FormPropostaComponent';
import LoginForm from './components/LoginComponent.jsx';
import FeedbackContext from "./contexts/FeedbackContext.js";
import API from './API.mjs';

// import models
import Fase from './models/Fase.mjs';

function App() {
    const navigate = useNavigate();

    // stato per l'utente loggato
    const [utente, setUtente] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    // variabili di stato "locali" per il budget, la fase, le proposte e le preferenze dell'utente loggato
    const [localBudget, setLocalBudget] = useState();
    const [localFase, setLocalFase] = useState();
    const [listaProposteUtente, setListaProposteUtente] = useState([]);     // solo proposte dell'utente loggato
    const [listaProposte, setListaProposte] = useState([]);                 // tutte le proposte 
    const [listaPreferenze, setListaPreferenze] = useState([]);             // tutte le preferenze
    const [listaUtenti, setListaUtenti] = useState([]);                     // tutti gli utenti

    // Variabile di stato che se vale true indica che si è in modalità ospite, utilizzata per far accedere gli utenti
    // non loggati alla "UserConsole". 'ospiteMod' viene messa a true quando l'utente ospite clicca su "Entra come ospite"
    // nella pagina di login.
    const [ospiteMod, setOspiteMod] = useState(false);

    // Flag per forzare il refresh della pagina ogni volta che avviene una modifica nel database
    const [shouldRefresh, setShouldRefresh] = useState(true);

    // Stato per i feedback da mostrare all'utente
    const [feedback, setFeedback] = useState('');

    // gestione degli errori
    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message);
    };

    // gestione del login: se l'utente è loggato, setto il flag loggedIn a true e salvo l'utente
    const handleLogin = async (credenziali) => {
        const utente = await API.logIn(credenziali);
        setUtente(utente);
        setLoggedIn(true);
        setFeedback("Benvenuto, " + utente.username + "!");
    };

    // gestione del logout: setto il flag loggedIn a false e cancello l'utente e le proposte locali
    const handleLogout = async () => {
        await API.logOut()
            .then(() => {
                setLoggedIn(false);
                setUtente(null);
                setListaProposteUtente([]);
                setOspiteMod(false);
                setFeedback("Arrivederci!");
                navigate('/');
            })
            .catch((err) => setFeedbackFromError(err));
        
    };

    // Al caricamento della pagina, controllo se l'utente è loggato solo la prima volta che avvio l'app (anche in
    // seguito a un refresh della pagina browser). Se l'utente è loggato, setto il flag loggedIn a true e salvo l'utente,
    // altrimenti si riceveranno degli errori.
    useEffect(() => {
        API.getUserInfo()
            .then((user) => {
                setLoggedIn(true);
                setUtente(user);
            })
            .catch((err) => {
                if (loggedIn) setFeedbackFromError(err);
                setLoggedIn(false);
                setUtente(null);
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            // provo a ottenere la fase corrente, se non esiste la inizializzo a 0
            try {
                let fase = await API.getFase();
                setLocalFase(fase.valore);
            } catch (err) {
                try {
                    await API.createFase();
                    setLocalFase(0);
                } catch (err) {
                    // non mostro l'errore a schermo se l'utente non è loggato
                    if (loggedIn) setFeedbackFromError(new Error("Errore nella creazione della fase"));
                }
            }
            
            // ottengo la lista delle proposte totali, ordinate prima per approvazione, poi per punteggio decrescente e costo crescente
            try {
                let proposte = await API.getProposte();
                let proposteOrdinate = proposte.sort((a, b) => {
                    if (a.approvata === "true" && b.approvata === "false") return -1;
                    if (a.approvata === "false" && b.approvata === "true") return 1;
                    if (a.punteggio !== b.punteggio) return b.punteggio - a.punteggio;
                    return a.costo - b.costo;
                });
                setListaProposte(proposteOrdinate);
            } catch (err) {
                setFeedbackFromError(err);
            }
            
            // ottengo la lista delle preferenze totali
            try {
                let preferenze = await API.getListaPreferenze();
                setListaPreferenze(preferenze);
            } catch (err) {
                setFeedbackFromError(err);
            }

            // ottengo la lista degli utenti con i loro username
            try {
                let utenti = await API.getUtenti();
                setListaUtenti(utenti);
            } catch (err) {
                setFeedbackFromError(new Error("Errore nel recupero degli utenti"));
            }

            // se l'utente è loggato (quindi per utenti e amministratori), recupero il budget e le proposte dell'utente loggato
            if (loggedIn) {
                try {
                    let budget = await API.getBudget();
                    setLocalBudget(budget.valore);
                } catch (err) {
                    if (err.message !== "Service Unavailable") {
                        setFeedbackFromError(err);
                    }
                }
    
                try {
                    let proposteUtente = await API.getProposteUtente(utente.id);
                    setListaProposteUtente(proposteUtente);
                } catch (err) {
                    setFeedbackFromError(err);
                }
    
                setShouldRefresh(false);
            }
        };
    
        fetchData();
    }, [loggedIn, shouldRefresh]);

    // Funzione per impostare il valore della fase al valore passato in input, poi ricarica la pagina per ottenere il nuovo valore
    // aggiornato della fase direttamente da database
    const cambiaFase = (valore) => {
        API.editFase(new Fase(undefined, valore))
            .then(() => setShouldRefresh(true))
            .catch((err) => setFeedbackFromError(err));
    };

    return (<>
        <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError, setShouldRefresh, loggedIn }}>
            {<NavHeader feedback={feedback} ospiteMod={ospiteMod} setOspiteMod={setOspiteMod} utente={utente} localFase={localFase} cambiaFase={cambiaFase} handleLogout={handleLogout} />}
            <Routes>
                <Route path="/" element={
                    // Se l'utente non è loggato e ancora NON si è nella fase di definizione proposte, non può accedere alla console.
                    // Quando l'utente loggedIn==true, la condizione diventa falsa e può accedere alla console come utente loggato,
                    // oppure se loggedIn==false e definizioneProposte==true, l'utente ospite può entrare nella console utente.
                    (!loggedIn && !ospiteMod) ? <Navigate to='/login'/> : <UserConsole localFase={localFase} utente={utente} localBudget={localBudget} listaProposte={listaProposte} 
                        listaProposteUtente={listaProposteUtente} listaPreferenze={listaPreferenze} listaUtenti={listaUtenti} />
                } />
                <Route path="/addBudget" element={
                    loggedIn && <FormBudget utente={utente} cambiaFase={cambiaFase} localFase={localFase} />
                } />
                <Route path='/addProposta' element={
                    loggedIn && <FormProposta utente={utente} localBudget={localBudget}/>
                } />
                <Route path='/editProposta/:idProposta' element={
                    loggedIn && <FormProposta utente={utente} listaProposteUtente={listaProposteUtente} localBudget={localBudget} /> // passo solo le proposte dell'utente idUser
                } />
                <Route path='/login' element={
                    loggedIn ? <Navigate to='/' /> : <LoginForm handleLogin={handleLogin} setOspiteMod={setOspiteMod}/>
                } />
                <Route path='*' element={ <NotAuthorized /> } />
            </Routes>
        </FeedbackContext.Provider>
    </>);
};

export default App;
