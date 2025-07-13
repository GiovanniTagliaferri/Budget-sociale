import { useState, useContext } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import API from "../API.mjs";
import Proposta from "../models/Proposte.mjs";
import FeedbackContext from "../contexts/FeedbackContext";

function FormProposta(props) {
    const navigate = useNavigate();
    const {setFeedbackFromError, setFeedback, setShouldRefresh} = useContext(FeedbackContext);
    
    // recupera i dati della proposta dalla lista di proposte dell'utente (se esiste)
    const { idProposta } = useParams();  // recupera l'id della proposta dall'url
    const localProposta = props.listaProposteUtente ? props.listaProposteUtente.find((proposta) => proposta.id === Number(idProposta)) : undefined;

    // se localProposta esiste, setto i valori iniziali con quelli della proposta, altrimenti setto i valori iniziali di default
    const [descrizione, setDescrizione] = useState(localProposta ? localProposta.descrizione : '');
    const [costo, setCosto] = useState(localProposta ? localProposta.costo : '');
    const [data, setData] = useState(localProposta ? localProposta.data : dayjs().format('YYYY-MM-DD'));
    const localBudget = props.localBudget;

    // creo una nuova proposta, setto shouldRefresh a true cosi da ricaricare la lista delle proposte
    const createProposta = (proposta) => {
        API.createProposta(proposta)
            .then(() => {
                setFeedback("Proposta aggiunta con successo")
                setShouldRefresh(true)})
            .catch((err) => setFeedbackFromError(err));
    }

    // modifica una proposta
    const editProposta = (proposta) => {
        API.editProposta(proposta)
            .then(() => {
                setFeedback("Proposta modificata con successo")
                setShouldRefresh(true)})
            .catch((err) => setFeedbackFromError(err));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const finalcosto = Number(costo);
        const proposta = new Proposta(Number(idProposta), descrizione, finalcosto, dayjs(data).format("YYYY-MM-DD"), props.utente.id);
        
        if(finalcosto > localBudget) {
            setFeedbackFromError(new Error("Il costo della proposta non può superare il budget"));
            return;
        }
        else if(idProposta) editProposta(proposta); // se idProposta esiste, vuol dire che siamo in modalità "edit" e la proposta opportuna viene modificata
        else createProposta(proposta);  // creo la nuova proposta
        navigate('/');
    };

    return (<>
        <Container className="d-flex justify-content-center align-items-center">
            <Row>
                <Col>
                    <h3>Fai una proposta che non superi il budget di {localBudget}€</h3>
                    <Form onSubmit={handleSubmit} className="mt-4">
                        <Form.Group>
                            <Form.Label>Descrizione</Form.Label>
                            <Form.Control type="text" value={descrizione} required={true} placeholder="Inserisci la descrizione" onChange={(event) => setDescrizione(event.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Costo</Form.Label>
                            <Form.Control type="number" value={costo} min={0} step="any" max={localBudget} required={true} placeholder="Inserisci il costo" onChange={(event) => setCosto(event.target.value)}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Data</Form.Label>
                            <Form.Control type="date" value={data} max={dayjs().format("YYYY-MM-DD")} onChange={(event) => setData(event.target.value)}/>
                        </Form.Group>
                        {!idProposta && <Button variant="success" type="submit" className="mt-1">Aggiungi</Button>}
                        {idProposta && <Button variant="primary" type="submit" className="mt-1">Modifica</Button>}
                        <Button variant="danger" className="mt-1 ms-1" onClick={() => navigate('/')}>Annulla</Button>
                    </Form>
                </Col>
            </Row>
        </Container>

    </>)
}

export default FormProposta;