import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NotAuthorized() {
  return (
    <Container>
      <h1>Pagina non trovata...</h1>
      <p>Questa pagina non esiste.</p>
      <Link className="btn btn-danger" to="/">Indietro</Link>
    </Container>
  );
}

export default NotAuthorized;