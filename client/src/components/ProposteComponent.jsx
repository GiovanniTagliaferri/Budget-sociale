import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useEffect, useState, useContext } from "react";
import "../App.css";
import API from "../API.mjs";
import Preferenza from "../models/Preferenze.mjs";
import FeedbackContext from "../contexts/FeedbackContext";

function ProposteTabella(props) {
    const navigate = useNavigate();
    const {setFeedbackFromError, setShouldRefresh, setFeedback} = useContext(FeedbackContext);
    
    const utente = props.utente;
    const idUser = utente ? utente.id : null;
    const ruolo = utente ? utente.ruolo : 'ospite';

    const listaProposteUtente = props.listaProposteUtente;
    const listaProposte = props.listaProposte;
    const localFase = props.localFase;
    const localBudget = props.localBudget;
    const numProposte = listaProposteUtente.length;
    const listaUtenti = props.listaUtenti;
    const listaPreferenze = props.listaPreferenze;

    const [preferenza, setPreferenza] = useState(false);    // variabile di stato per la visualizzazione del form per la preferenza
    const [idPropostaPreferenza, setIdPropostaPreferenza] = useState();    // id della proposta da votare
    const [preferenzaProposta, setPreferenzaProposta] = useState(0);       // preferenza da dare alla proposta [1, 2, 3]
    const [editDeletePreferenza, setEditDeletePreferenza] = useState();    // variabile per creare, modificare o eliminare la preferenza in handlePreferenzaProposta

    // Gestisco l'aggiunta di una proposta: se l'utente ha già 3 proposte, non può aggiungerne altre,
    // altrimenti lo reindirizzo alla pagina per aggiungere una proposta.
    const handleAddProposta = async (event) => {
        event.preventDefault();

        // controllo se la fase è ancora 1: se si procedo, altrimenti mostro un errore
        const fase = await API.getFase();
        if (fase.valore !== localFase) {
            setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
            return;
        }

        if (numProposte >= 3) {
            setFeedbackFromError(new Error("Non puoi inserire più di 3 proposte"));
        } else {
            navigate('/addProposta');
        }
    };

    // Modifica proposta: reindirizzo l'utente alla pagina per modificare la proposta
    const handleEditProposta = async (idProposta) => {
        // controllo se la fase sia ancora 1
        const fase = await API.getFase();
        if (fase.valore !== localFase) {
            setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
            return;
        }

        navigate(`/editProposta/${idProposta}`);
    };
    
    // Cancella proposta e setta shouldRefresh a true per ricaricare la lista delle proposte
    const deleteProposta = async (idProposta) => {
        // controllo se la fase è ancora 1: se si procedo, altrimenti mostro un errore
        const fase = await API.getFase();
        if (fase.valore !== localFase) {
            setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
            return;
        }
        
        API.deleteProposta(idProposta)
            .then(() => {
                setFeedback("Proposta cancellata con successo");
                setIdPropostaPreferenza('')
                setShouldRefresh(true);
            })
            .catch((err) => setFeedbackFromError(err));
    }
    
    // Creazione di una preferenza dati l'id della proposta, l'id dell'utente e il valore della preferenza
    const voteProposta = (idProposta, idUtente, valore) => {
        API.createPreferenza(new Preferenza(undefined, idProposta, idUtente, valore))
            .then(() => {
                setFeedback("Preferenza inserita con successo");
                setIdPropostaPreferenza('')})
            .catch((err) => setFeedbackFromError(err));
    }

    // Cancellazione di una preferenza dati l'id della proposta e l'id dell'utente
    const deletePreferenza = (idProposta, idUtente) => {
        API.deletePreferenza(idProposta, idUtente)
            .then(() => {
                setFeedback("Preferenza cancellata con successo");
                setIdPropostaPreferenza('')
                setShouldRefresh(true)
            })
            .catch((err) => setFeedbackFromError(err));
    }

    // modifica di una preferenza
    const editPreferenza = (idProposta, idUtente, valore) => {
        API.editPreferenza(new Preferenza(undefined, idProposta, idUtente, valore))
            .then(() => {
                setFeedback("Preferenza modificata con successo");
                setIdPropostaPreferenza('')
            })
            .catch((err) => setFeedbackFromError(err));
    }

    // gestisco l'aggiunta o la cancellazione di una preferenza
    const handlePreferenzaProposta = async (event) => {
        event.preventDefault();

        // controllo se la fase sia ancora 2
        const fase = await API.getFase();
        if (fase.valore !== localFase) {
            setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
            return;
        }
        if(editDeletePreferenza === 'add') {
            voteProposta(idPropostaPreferenza, idUser, preferenzaProposta);
        }
        else if(editDeletePreferenza === 'edit') {
            editPreferenza(idPropostaPreferenza, idUser, preferenzaProposta);
        }
        else if(editDeletePreferenza === 'delete') {
            deletePreferenza(idPropostaPreferenza, idUser);
        }
        
        // setIdPropostaPreferenza();
        setPreferenza(false);
        setPreferenzaProposta();
        setEditDeletePreferenza();
    };

    // Calcolo il punteggio per ogni proposta e restituisco le proposte con il loro punteggio totale.
    // Ottengo lista del tipo [{idProposta, punteggio totale}] e contiene solo le proposte di cui è stata espressa almeno una preferenza.
    const calcolaPropostePunteggio = async () => {
        // ricarico dal db la lista delle proposte e delle preferenze insieme
        const listaProposteLocale = await API.getProposte();
        const listaPreferenzeLocale = await API.getListaPreferenze();
        
        let listaIdProposte = listaPreferenzeLocale.map((p) => p.idProposta); // lista degli id delle proposte
        const setListaIdProposte = new Set(listaIdProposte); // elimino i duplicati
        listaIdProposte = [...setListaIdProposte];

        // const listaProposteCopia = [...listaProposte]; // copia della lista delle proposte
        const propostePunteggio = [];

        for(const idProposta of listaIdProposte) {
            const preferenzeProposta = listaPreferenzeLocale.filter((p) => parseInt(p.idProposta) === parseInt(idProposta));
            const punteggioTotale = preferenzeProposta.reduce((acc, prop) => acc + parseInt(prop.valore), 0);
            
            const proposta = listaProposteLocale.find((p) => p.id === idProposta);
            if (proposta) {
                proposta.punteggio = punteggioTotale;
                propostePunteggio.push(proposta);
            }
        }

        // combino le proposte con il punteggio totale calcolato in precedenza
        listaProposteLocale.forEach(propostaOriginale => {
            const newProposta = propostePunteggio.find(p => p.id === propostaOriginale.id);
            if (newProposta) {
                propostaOriginale.punteggio = newProposta.punteggio;
            }
        });

        // ordino le proposte in base al punteggio decrescente
        listaProposteLocale.sort((a, b) => b.punteggio - a.punteggio);

        // sommo i costi delle proposte fino a che non supero il budget
        let sommaCosti = 0;

        for (const proposta of listaProposteLocale) {
            const costo = Number(proposta.costo);
            sommaCosti += costo;

            if (Number(sommaCosti) <= Number(localBudget)) {
                proposta.approvata = 'true';
            } else {
                break;
            }
        }

        // Creo un array di promesse per l'aggiornamento delle proposte
        const promesseAggiornamento = listaProposteLocale.map(proposta => API.editProposta(proposta));

        // Uso Promise.all per attendere la risoluzione di tutte le promesse
        await Promise.all(promesseAggiornamento)
            .then(() => {
                setShouldRefresh(true);
            })
            .catch((err) => {
                setFeedbackFromError(err);
            });

        return
    };
    
    // Quando la fase passa da 2 a 3 e l'utente è un amministratore, calcolo i punteggi delle proposte
    useEffect(() => {
        if(localFase === 3 && ruolo === 'amministratore') {
            calcolaPropostePunteggio();
        }
    }, [localFase]);


    return (
        <>
            <Container>
                {localFase === 3 && <h3>Le proposte accettate sono evidenziate in verde</h3>}
                <Row> 
                    <Col className="fw-bold">Descrizione</Col>
                    <Col className="fw-bold">Costo (in €)</Col>
                    {localFase !== 3 && <>
                        <Col className="fw-bold">Data</Col>
                        <Col className="fw-bold">Azioni</Col>
                    </>}
                    {localFase === 3 && <>
                        <Col className="fw-bold">Utente</Col>
                        <Col className="fw-bold">Punteggio</Col>
                    </>}
                </Row>
                
                {/* per fase 1 vengono mostrate solo le proposte dell'utente loggato per aggiungerle, cancellarle o modificarle */}
                {localFase == 1 && listaProposteUtente.map((proposta) => (
                    <ProposteRiga key={proposta.id} proposta={proposta} handleEditProposta={handleEditProposta} deleteProposta={deleteProposta} localFase={localFase}
                        />
                ))}

                {/* per fase 2 vengono mostrate tutte le proposte di tutti utenti */}
                {localFase == 2 && listaProposte.map((proposta) => (
                    <ProposteRiga key={proposta.id} proposta={proposta} localFase={localFase}
                        preferenza={preferenza} setPreferenza={setPreferenza} handlePreferenzaProposta={handlePreferenzaProposta} setPreferenzaProposta={setPreferenzaProposta}
                        idPropostaPreferenza={idPropostaPreferenza} setIdPropostaPreferenza={setIdPropostaPreferenza} idUser={idUser} listaPreferenze={listaPreferenze} editDeletePreferenza={editDeletePreferenza}
                        setEditDeletePreferenza={setEditDeletePreferenza}/>
                ))}

                {/* in seguito a login successivi la lista delle proposte viene presa direttamente dal db */}
                {localFase === 3 &&
                    listaProposte.map((proposta) => (
                        <ProposteRiga key={proposta.id} proposta={proposta} localFase={localFase} listaUtenti={listaUtenti}/>
                    ))
                }

                {/* se fase === 1 mostro il bottone per aggiungere una nuova proposta */}
                {localFase === 1 && <Button className="btn-success" onClick={handleAddProposta}>Aggiungi</Button>}

            </Container>

        </>
    )
};

function ProposteRiga(props) {
    const { proposta, localFase, listaUtenti } = props;
    const {loggedIn} = useContext(FeedbackContext);

    // Per la fase 3, aggiungi le colonne per "Utente" e "Punteggio"
    if (localFase === 3) {
        const utente = listaUtenti.find(u => u.id === Number(proposta.idUtente));
        const approvata = proposta.approvata;
        return (
            // agli utenti non loggati mostro solo le proposte accettate
            !loggedIn && approvata === 'false' ? null :
            <Row className={approvata === "true" ? "bg-success text-white": ''}>
                <Col>{proposta.descrizione}</Col>
                <Col>{proposta.costo}</Col>
                <Col>{
                    // nascondo l'username degli utenti le cui proposte non sono state accettate
                    utente && proposta.approvata === "true" ? utente.username : ''
                }</Col>
                <Col>{proposta.punteggio}</Col>
            </Row>
        );
    }

    if (localFase === 1 || localFase === 2) {
        return (
            <Row>
                <Col>{proposta.descrizione}</Col>
                <Col>{proposta.costo}</Col>
                <Col>{dayjs(proposta.data).format('YYYY-MM-DD')}</Col>
                <Col>
                    <Azioni idProposta={proposta.id} handleEditProposta={props.handleEditProposta} deleteProposta={props.deleteProposta} localFase={props.localFase}
                    preferenza={props.preferenza} setPreferenza={props.setPreferenza} handlePreferenzaProposta={props.handlePreferenzaProposta} setPreferenzaProposta={props.setPreferenzaProposta} 
                    idPropostaPreferenza={props.idPropostaPreferenza} setIdPropostaPreferenza={props.setIdPropostaPreferenza}
                    idUtenteProposta={proposta.idUtente} idUser={props.idUser} listaPreferenze={props.listaPreferenze} editDeletePreferenza={props.editDeletePreferenza} setEditDeletePreferenza={props.setEditDeletePreferenza}/>
                </Col>
            </Row>
        );
    }
}

function Azioni(props) {
    const preferenza = props.preferenza;
    const setPreferenza = props.setPreferenza;
    const {setFeedbackFromError, setShouldRefresh} = useContext(FeedbackContext);
    
    // Controllo se l'user ha già votato la proposta e in caso positivo, mostro il tasto per modificare o revocare la proposta
    // (solo nella fase 2: uso useEffect in modo che nella fase 1 "preferenzaEsistente" sia sempre vuoto e quando cambia
    // la fase, viene aggiornato il suo valore)
    const [preferenzaEsistente, setPreferenzaEsistente] = useState('');
    useEffect(() => {
        if(props.localFase === 2) {
            // se la preferenza gia' esiste, la riporto imposto a null, altrimenti vedo se l'utente ha gia' votato la proposta
            API.getPreferenzeProposta(props.idProposta)
                .then((preferenze) => {
                    const preferenzaUtente = preferenze.find((p) => p.idUtente === props.idUser);
                    setPreferenzaEsistente(preferenzaUtente ? Object.values(preferenzaUtente)[3] : '');     // ottengo il voto
                    setShouldRefresh(true);
                })
                .catch((err) => setFeedbackFromError(err));
            
        }
    }, [props.idPropostaPreferenza]);   // forzo l'esecuzione dello useEffect quando l'id della proposta da votare cambia (ne viene selezionata un'altra o il valore viene ripristinato a null)

    const numIdUtenteProposte = Number(props.idUtenteProposta);
    return (<>
        {/* tasti per cancellare o modificare una proposta */}
        {props.localFase === 1 && (<>
            <Button variant="primary" onClick={() => props.handleEditProposta(props.idProposta) }>Modifica</Button>
            {/* <Link to={`/editProposta/${props.idProposta}`} className="btn btn-primary">Modifica</Link> */}
            <Button variant="danger" className="ms-1" onClick={() => {props.deleteProposta(props.idProposta)}}>Elimina</Button>
        </>)}

        {props.localFase === 2 && (<>
            <Row>
                {/* visualizzo tasto per votare una proposta se:
                    preferenza è NON impostata (variabile per vedere il form per esprimere una preferenza) 
                    NON si tratta di una proposta postata dall'utente in questione
                    NON esiste una preferenza dell'utente sulla proposta in questione
                    NON si tratta della proposta che si sta modificando o eliminando in generale (idProposta !== idPropostaPreferenza)
                */}
                {(!preferenza && props.idUser !== numIdUtenteProposte && !preferenzaEsistente && (props.idProposta !== props.idPropostaPreferenza || props.editDeletePreferenza !== 'delete')) &&
                <Col>
                    <Button variant="success" className="ms-1" onClick={
                        async () => {
                            const fase = await API.getFase();
                            if (fase.valore !== props.localFase) {
                                setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
                                return;
                            }
                            setPreferenza(true); props.setIdPropostaPreferenza(props.idProposta); props.setEditDeletePreferenza('add')}
                        
                        }>Vota</Button>
                </Col>}
               
                {/* visualizzo tasto per modificare o eliminare una preferenza se:
                    preferenza è NON impostata
                    NON si tratta di una proposta postata dall'utente in questione
                    esiste una preferenza dell'utente sulla proposta in questione
                    NON si tratta della proposta che si sta modificando o eliminando in generale    
                */}
                {(!preferenza && props.idUser !== numIdUtenteProposte && props.idProposta !== props.idPropostaPreferenza && preferenzaEsistente) &&
                <Col>
                    <Button variant="success" onClick={
                        async () => {
                            const fase = await API.getFase();
                            if (fase.valore !== props.localFase) {
                                setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
                                return;
                            }
                            setPreferenza(true); props.setIdPropostaPreferenza(props.idProposta); props.setEditDeletePreferenza('edit')}
                        }>Modifica</Button>

                    <Button variant="danger" className="ms-2" onClick={
                        async () => {
                            const fase = await API.getFase();
                            if (fase.valore !== props.localFase) {
                                setFeedbackFromError(new Error("La fase è cambiata, ricarica la pagina"));
                                return;
                            }
                            setPreferenza(true); props.setIdPropostaPreferenza(props.idProposta); props.setEditDeletePreferenza('delete')}}>Elimina</Button>
                    <span className="ms-2 width-2">{preferenzaEsistente ? preferenzaEsistente : 'voto'}</span>
                </Col>}

                {/* disabilito i tasti */}
                {(preferenza && props.idUser !== numIdUtenteProposte && props.idProposta !== props.idPropostaPreferenza && !preferenzaEsistente) &&
                <Col>
                    <Button variant="success" className="ms-1" disabled>Vota</Button>
                </Col>}

                {(preferenza && props.idUser !== numIdUtenteProposte && props.idProposta !== props.idPropostaPreferenza && preferenzaEsistente) &&
                     <Col>
                         <Button variant="success" disabled>Modifica</Button>
                         <Button variant="danger" className="ms-2" disabled>Elimina</Button>                    
                         <span className="ms-2 width-2">{preferenzaEsistente ? preferenzaEsistente : 'voto'}</span>
                     </Col>}

                {(props.idUser === numIdUtenteProposte) &&
                     <Col>
                         <Button variant="success" className="ms-1" disabled>Vota</Button>
                     </Col>}

                {/* form per esprimere una preferenza */}
                {(preferenza && props.idUser !== numIdUtenteProposte && props.idProposta === props.idPropostaPreferenza) && 
                    <Form onSubmit={props.handlePreferenzaProposta}>
                        <Form.Group className="d-flex align-items-center">
                            {(props.editDeletePreferenza === 'add' || props.editDeletePreferenza === 'edit') && <>
                                <Button variant="success" type="submit">Conferma</Button>
                                <Button variant="danger" className="ms-2" onClick={() => {setPreferenza(false); props.setIdPropostaPreferenza()}}>Annulla</Button>
                                <Form.Control style={{ width: '80px' }} className="ms-2" type="number" min={1} max={3} onChange={(event) => props.setPreferenzaProposta(event.target.value)} placeholder={preferenzaEsistente ? preferenzaEsistente : 'voto'} />
                                </>}
                            {props.editDeletePreferenza === 'delete' && <>
                                <Button variant="danger" type="submit" onClick={() => setPreferenzaEsistente('')}>Conferma</Button>
                                <Button variant="primary" className="ms-2" onClick={() => {setPreferenza(false); props.setIdPropostaPreferenza()}}>Annulla</Button></>}
                        </Form.Group>
                    </Form>
                }
            </Row>
        </>)}
    </>)
}

export default ProposteTabella;
