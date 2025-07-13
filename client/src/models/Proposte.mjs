import dayjs from 'dayjs';

export function Proposta(id, descrizione, costo, data, idUtente, approvata = "false", punteggio = 0) {
    this.id = id;
    this.descrizione = descrizione;
    this.costo = costo;
    this.data = dayjs(data);
    this.idUtente = idUtente;
    this.approvata = approvata;
    this.punteggio = punteggio;
};


export default Proposta;