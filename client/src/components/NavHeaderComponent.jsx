import { Container, Button, Navbar, Nav, Toast, ToastBody } from "react-bootstrap";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackContext from "../contexts/FeedbackContext";
import API from "../API.mjs";
import '../App.css';

function NavHeader(props) {
    const navigate = useNavigate();
    const {setFeedbackFromError, setShouldRefresh, setFeedback, loggedIn} = useContext(FeedbackContext);
    const utente = props.utente;
    const ruolo = utente ? utente.ruolo : 'ospite'; // se l'utente non è loggato, è un ospite
    const localFase = props.localFase;
    const feedback = props.feedback;    // feedback da mostrare all'utente

    // alla fase 3 vedo il bottone per tornare alla fase 0 e resettare il db
    const handleReset = () => {
        props.cambiaFase(0);    // torno alla fase 0
    
        // attendo il completamento di tutte le Delete per ricaricare l'applicazione
        Promise.all([
            API.deleteAllProposte().catch(err => setFeedbackFromError(err)),
            API.deleteAllPreferenze().catch(err => setFeedbackFromError(err)),
            API.deleteBudget().catch(err => setFeedbackFromError(err))
        ])
        .then(() => {
            setFeedback("Reset effettuato con successo");
            setShouldRefresh(true);
        })
        .catch((err) => setFeedbackFromError(err));
    }
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary" >
                <Container fluid>
                    {loggedIn &&
                    <Navbar.Brand variant="outline-success">Fase {localFase}</Navbar.Brand>}
                    {!loggedIn && localFase < 3 &&
                    <Navbar.Brand variant="outline-success"></Navbar.Brand>}

                    <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }}>
                        <Navbar.Brand> </Navbar.Brand>
                        <Navbar.Brand> </Navbar.Brand>

                        {/* modalità ospite */}
                        {props.ospiteMod && <Navbar.Brand> Modalità {ruolo}</Navbar.Brand>}

                        {/* mostro lo username se l'utente è loggato */}
                        {loggedIn && <Navbar.Brand> Modalità {ruolo} di {utente.username}</Navbar.Brand>}

                        {/* tasto per avanzare di fase (da fase 1 -> 2 e da fase 2 -> 3) */}
                        {ruolo === 'amministratore' && localFase > 0 && localFase < 3 &&
                            <Button variant="success" onClick={() => props.cambiaFase(localFase+1)}>Avanza fase</Button>}

                        {/* tasto per tornare alla fase 0 dalla fase 3 e resettare budget, proposte, preferenze */}
                        {ruolo === 'amministratore' && localFase === 3 &&
                            <Button variant="success" onClick={() => handleReset()}>Torna alla fase 0</Button>}
                    </Nav>

                    {/* mostro tutti gli avvisi dell'applicazione in questo toast, sia di errore che non */}
                    {feedback &&
                    <Toast className={feedback === "Credenziali errate" ? "bg-danger": ""} show={feedback !== ''} onClose={() => setFeedback('')} delay={3000} autohide>
                        <ToastBody>{feedback}</ToastBody>
                    </Toast>}
                </Container>

                {/* a seconda che l'utente sia loggato o no mostro il tasto di Logout o Login */}
                {loggedIn ? 
                    <Button className='ms-2' variant="outline-success" onClick={props.handleLogout}>Logout</Button> : 
                    <Button className='ms-2' variant="outline-success" onClick={()=> {navigate('/login'); props.setOspiteMod(false)}}>Login</Button>}
                <Navbar.Brand> </Navbar.Brand>
            </Navbar>
        </>
    );
}

export default NavHeader;