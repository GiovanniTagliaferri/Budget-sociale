import db from '../db.mjs';
import { PropostaNotFoundError, UtenteNotFoundError } from '../errori.mjs';

export function Proposta(id, descrizione, costo, data, idUtente, approvata = "false", punteggio = 0) {
    this.id = id;
    this.descrizione = descrizione;
    this.costo = costo;
    this.data = data;
    this.idUtente = idUtente;
    this.approvata = approvata;
    this.punteggio = punteggio;
};

function mapRowsToProposte(rows) {
    return rows.map((row) => {
        return new Proposta(row.id, row.descrizione, row.costo, row.data, row.idUtente, row.approvata, row.punteggio);
    });
};

export default function ProposteDAO() {
    // crea una proposta
    this.createProposta = (proposta) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO proposta (descrizione, costo, data, idUtente, approvata, punteggio) VALUES (?, ?, ?, ?, ?, ?)";
            const values = [proposta.descrizione, proposta.costo, proposta.data, proposta.idUtente, proposta.approvata, proposta.punteggio];
            db.run(sql, values, function (err) {
                if(err) {
                    reject(err);
                } else {
                    proposta.id = this.lastID;
                    resolve(proposta);
                }
            });
        });
    };

    // restituisce una proposta dato l'id e l'idUtente
    this.getProposta = (idProposta, idUtente) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM proposta WHERE id = ? AND idUtente = ?";
            db.get(sql, [idProposta, idUtente], (err, row) => {
                if(err) {
                    reject(err);
                } else if(row === undefined) {
                    reject(new PropostaNotFoundError());
                } else {
                    resolve(mapRowsToProposte([row])[0]);
                }
            });
        });
    };

    // restituisce tutte le proposte
    this.getProposte = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM proposta";
            db.all(sql, [], (err, rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(mapRowsToProposte(rows));
                }
            });
        });
    };

    // restituisce tutte le proposte di un utente dato il suo id
    this.getProposteUtente = (idUtente) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM utente WHERE id = ?";
            db.get(sql, [idUtente], (err, row) => {
                if(err) {
                    reject(err);
                } else if(row === undefined) {
                    reject(new UtenteNotFoundError());
                } else {
                    const sql = "SELECT * FROM proposta WHERE idUtente = ?";
                    db.all(sql, [idUtente], (err, rows) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(mapRowsToProposte(rows));
                        }
                    });
                }
            });
        });
    };

    // modifica una proposta
    this.editProposta = (proposta) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE proposta SET descrizione = ?, costo = ?, data = ?, punteggio = ?, approvata = ? WHERE id = ? AND idUtente = ?";
            const values = [proposta.descrizione, proposta.costo, proposta.data, proposta.punteggio, proposta.approvata, proposta.id, proposta.idUtente];
            db.run(sql, values, function (err) {
                if(err) {
                    reject(err);
                } else if(this.changes === 0) {     // nessuna riga modificata
                    reject(new PropostaNotFoundError());
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // cancella una proposta di un utente
    this.deleteProposta = (idProposta, idUtente) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM proposta WHERE id = ? AND idUtente = ?";
            db.run(sql, [idProposta, idUtente], function (err) {
                if(err) {
                    reject(err);
                } else if(this.changes === 0) {     // nessuna riga cancellata
                    reject(new PropostaNotFoundError());
                } else {
                    resolve(this.changes);
                }
            });
        });
    };

    // cancella tutte le proposte
    this.deleteAllProposte = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM proposta";
            db.run(sql, [], function (err) {
                if(err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    };
};
