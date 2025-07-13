import db from '../db.mjs';
import { FaseNotFoundError, FaseAlreadyExistsError } from '../errori.mjs';

export function Fase(id, valore) {
    this.id = id;
    this.valore = valore;
};

function mapRowsToFase(rows) {
    return rows.map((row) => {
        return new Fase(row.id, row.valore);
    });
}

export default function FaseDAO() {
    // inizializza la fase a 0 se non esiste
    this.createFase = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM fase";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err);
                } else if(row) {
                    reject(new FaseAlreadyExistsError());
                } else {
                    const sql = "INSERT INTO fase (valore) VALUES (0)";
                    db.run(sql, function(err) {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(new Fase(this.lastID, 0));
                        }
                    });
                }
            });
        });
    };

    // restituisce la fase corrente
    this.getFase = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM fase";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row) {
                    reject(new FaseNotFoundError());
                } else {
                    resolve(mapRowsToFase([row])[0]);
                }
            });
        });
    };

    // modifica la fase corrente (quindi se già esiste) con quella specificata
    this.editFase = (valore) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE fase SET valore = ?";
            db.run(sql, [valore], function(err) {
                if(err) {
                    reject(err);
                } else if(this.changes === 0) {
                    reject(new FaseNotFoundError());
                } else {
                    resolve("Fase modificata correttamente");
                }
            });
        });
    };

    // elimina la fase
    this.deleteFase = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM fase";
            db.run(sql, function(err) {
                if(err) {
                    reject(err);
                } else if(this.changes === 0) {
                    resolve("Fase eliminata correttamente");
                } else {
                    reject(new FaseNotFoundError());
                }
            });
        });
    };
};