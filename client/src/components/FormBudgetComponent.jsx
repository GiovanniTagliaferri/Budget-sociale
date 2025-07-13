import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Budget from "../models/Budget.mjs";
import API from "../API.mjs";
import FeedbackContext from "../contexts/FeedbackContext";

function FormBudget(props) {
    const navigate = useNavigate();
    const {setFeedbackFromError, setShouldRefresh, setFeedback} = useContext(FeedbackContext);

    const utente = props.utente;
    const [valoreBudget, setValoreBudget] = useState(0);
    const [conferma, setConferma] = useState(false);    // flag per confermare l'inserimento del budget

    // Creo il budget e lo salvo nel db + imposto shouldRefresh a true per forzare il refresh della pagina e aggiornare cosi
    // il valore del budget locale.
    const createBudget = (valore) => {
        const budget = new Budget(undefined, valore);
        API.createBudget(budget)
            .then(() => {
                setShouldRefresh(true)
                props.cambiaFase(1); // passo alla fase 1
                setFeedback("Budget impostato con successo");
            })   
            .catch((err) => setFeedbackFromError(err));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if(valoreBudget < 100) {    // controllo che il budget non sia inferiore a 100€ anche se è già controllato dalla form
            setFeedbackFromError(new Error("Il budget non può inferiore a 100€"));
            return;
        }
        createBudget(valoreBudget);
        navigate('/');
    };

    return (<>
        {utente.ruolo === 'amministratore' &&
        <Container className="d-flex justify-content-center align-items-center">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h3>Definisci un budget di almeno 100€ per proseguire</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBudget">
                            <Form.Label>Scegli il budget per il prossimo anno</Form.Label>
                            <Form.Control type="number" min={100} step="any" placeholder="Inserisci il budget" required onChange={(event) => setValoreBudget(event.target.value)}/>
                        </Form.Group>
                        {!conferma && <Button variant="success" onClick={() => setConferma(true)}>Aggiungi</Button>}
                        {conferma && <>
                            <Button variant="primary" type="submit">Conferma</Button>
                            <Button variant="danger" className="ms-1" onClick={() => setConferma(false)}>Annulla</Button>
                        </>}
                    </Form>
                </Col>
            </Row>
        </Container>}

        {/* controllo se per caso qualche utente non amministratore riesce a raggiungere questa pagina */}
        {utente.ruolo !== 'amministratore' &&
        <Container className="d-flex justify-content-center align-items-center">
            <Row>
                <Col>
                    <h3>Non sei autorizzato a definire un budget</h3>
                    <Link className="btn btn-danger" to="/">Torna alla home</Link>
                </Col>
            </Row>
        </Container>}
    </>)
};

export default FormBudget;