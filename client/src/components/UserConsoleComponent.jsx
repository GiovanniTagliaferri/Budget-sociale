import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProposteTabella from "./ProposteComponent";
import { useContext } from "react";
import FeedbackContext from "../contexts/FeedbackContext";

function UserConsole(props) {
    const {loggedIn} = useContext(FeedbackContext);

    const localFase = props.localFase;
    const localBudget = props.localBudget;

    const utente = props.utente;
    const ruolo = utente ? utente.ruolo : null;
    const listaProposteUtente = props.listaProposteUtente;
    const listaPreferenze = props.listaPreferenze;
    const listaUtenti = props.listaUtenti;

    return (<>
        {/* ============== FASE 0 ============== */}
        {/* se l'utente è un amministratore e la fase è 0, visualizzo il tasto per far apparire
        la form per aggiungere il budget e passare alla fase 1 */}
        {loggedIn && ruolo === 'amministratore' && localFase === 0 && 
            <Container className="d-flex justify-content-center align-items-center">
                <Row className="justify-content-md-center">
                    <Col md={5}>
                        <h3>Ciao! Siamo nella Fase 0 del nostro processo di allocazione del budget. 
                            Definisci il budget per il prossimo anno per passare alla fase successiva.</h3>
                        <Link className="btn btn-success" to="/addBudget">Definisci budget</Link>
                    </Col>
                </Row>
            </Container>}

        {/* utente normale vede un messaggio che la fase di definizione proposte è ancora chiusa */}
        {loggedIn && ruolo === 'utente' && localFase === 0 && 
        <Container className="d-flex justify-content-center align-items-center">
            <Row>
                <h3>Fase di definizione proposte ancora chiusa</h3>
            </Row>
        </Container>}

        {/* ============== FASE 1 ============== */}
        {/* per fase 1 permetto a ogni utente loggato di fare una proposta */}
        {loggedIn && localFase === 1 &&
            <Container>
                <Row>
                    <Col>
                        <h2>Le tue proposte</h2>
                        <ProposteTabella utente={utente} listaProposteUtente={listaProposteUtente} localFase={localFase} />
                    </Col>
                </Row>
            </Container>
        }
        
        {/* ============== FASE 2 ============== */}
        {/* per fase 2 permetto a ogni utente di votare le proposte tranne le proprie */}
        {loggedIn && localFase === 2 &&
            <Container>
                <Row>
                    <Col>
                        <h2>Vota le proposte degli altri utenti</h2>
                        <ProposteTabella utente={utente} listaProposteUtente={listaProposteUtente} listaProposte={props.listaProposte} listaPreferenze={listaPreferenze} localFase={localFase}/>
                    </Col>
                </Row>
            </Container>
        }

        {/* ============== FASE 3 ============== */}
        {/* Le proposte non posso essere modificate e vengono mostrate solo quelle approvate, cioè con punteggio più alto e somma dei costi <= del budget.
        Qualsiasi utente può vedere le proposte approvate. */}
        {localFase === 3 &&
            <Container>
                <Row>
                    <Col>
                        <ProposteTabella utente={utente} listaProposteUtente={listaProposteUtente} listaProposte={props.listaProposte} 
                            listaPreferenze={listaPreferenze} localFase={localFase} localBudget={localBudget} listaUtenti={listaUtenti} />
                    </Col>
                </Row>
            </Container>
        }

        {/* UTENTE NON LOGGATO */}
        { /* per fase 0, 1, 2 o non definita vede "fase definizione proposte ancora in corso" */}
        {!loggedIn && (localFase < 3 || !localFase) &&
        <Container className="d-flex justify-content-center align-items-center">
            <Row>
                <h3>Fase di definizione proposte ancora in corso</h3>
            </Row>
        </Container>}
    </>)
}

export default UserConsole;