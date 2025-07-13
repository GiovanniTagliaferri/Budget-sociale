import { useState, useContext } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import FeedbackContext from '../contexts/FeedbackContext';

function LoginForm(props) {
    const navigate = useNavigate();
    const { setFeedbackFromError } = useContext(FeedbackContext);

    // credenziali dell'utente
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // procedura di login
    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { "username": username, "password": password };

        props.handleLogin(credentials)
            .then ( () => navigate( "/" ) )
            .catch( (err) => {
                if(err.message === "Unauthorized")
                    setFeedbackFromError(new Error("Credenziali errate"));
                else
                    setFeedbackFromError(err);
                });
    };

  return (<>
        <Row className="mt-3 vh-100 justify-content-md-center">
            <Col md={4} >
                <h1 className="pb-3">Login</h1>
                <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={username} placeholder="Inserisci il tuo username."
                        onChange={(ev) => setUsername(ev.target.value)} required={true} />
                </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} placeholder="Inserisci la tua password."
                        onChange={(ev) => setPassword(ev.target.value)} required={true} minLength={5} />
                </Form.Group>
                <Button className="mt-3 btn btn-success" type="submit">Login</Button>
                <Link className='btn btn-outline-success ms-1 mt-3' to="/" onClick={() => props.setOspiteMod(true) }>Entra come ospite</Link>
                </Form>
            </Col>
        </Row>
    </>)
}

// LoginForm.propTypes = {
//   login: PropTypes.func,
// };

export default LoginForm;
