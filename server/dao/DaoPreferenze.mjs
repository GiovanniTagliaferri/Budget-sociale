import db from "../db.mjs";
import { PropostaNotFoundError, PreferenzaAlreadyExistsError, PreferenzaNotFoundError, AuthenticationError } from "../errori.mjs";

export function Preferenza(id, idProposta, idUtente, valore) {
    this.id = id;
    this.idProposta = idProposta;
    this.idUtente = idUtente;
    this.valore = valore;
};

function mapRowsToPreferenze(rows) {
    return rows.map((row) => {
        return new Preferenza(row.id, row.idProposta, row.idUtente, row.valore);
    });
};

export default function PreferenzeDAO() {
    // crea una preferenza se l'utente non ne ha già espresso una sulla proposta data
    this.createPreferenza = (preferenza) => {
        return new Promise((resolve, reject) => {
            // controllo prima se la proposta esiste
            const sql = "SELECT * FROM proposta WHERE id = ?";
            db.all(sql, [preferenza.idProposta], (err, rows) => {
                if(err) {
                    reject(err);
                } else if(rows.length !== 0) {
                    const sql = "SELECT * FROM preferenza WHERE idProposta = ? AND idUtente = ?";
                    db.all(sql, [preferenza.idProposta, preferenza.idUtente], (err, rows) => {
                        if(err) {
                            reject(err);
                        } else if(rows.length > 0) {
                            reject(new PreferenzaAlreadyExistsError());
                        }
                        else {  // non c'è una preferenza espressa
                            const sql = "INSERT INTO preferenza (idProposta, idUtente, valore) VALUES (?, ?, ?)";
                            db.run(sql, [preferenza.idProposta, preferenza.idUtente, preferenza.valore], function(err) {
                                if(err) {
                                    reject(err);
                                } else {
                                    preferenza.id = this.lastID;
                                    resolve(preferenza);
                                }
                            });
                        }
                    });
                } else {    // la proposta passata non esiste
                    reject(new PropostaNotFoundError());
                };
            });
        });
    };

    // cancella una preferenza dato idProposta e idUtente (se esiste)
    this.deletePreferenza = (idProposta, idUtente) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM proposta WHERE id = ?";
            db.get(sql, [idProposta], (err, row) => {
                if(err) {
                    reject(err);
                } else if(row === undefined) {
                    reject(new PropostaNotFoundError());
                } else {
                    const sql = "SELECT * FROM preferenza WHERE idProposta = ? AND idUtente = ?";
                    db.get(sql, [idProposta, idUtente], (err, row) => {
                        if(err) {
                            reject(err);
                        } else if(row === undefined) {
                            reject(new PreferenzaNotFoundError());
                        } else {
                            const sql = "DELETE FROM preferenza WHERE idProposta = ? AND idUtente = ?";
                            db.run(sql, [idProposta, idUtente], function(err) {
                                if(err) {
                                    reject(err);
                                } else {
                                    resolve("Preferenza cancellata correttamente");
                                }
                            });
                        }
                    });
                }
            });
        });
    };

    // cambia il valore di una preferenza esistente: cancella quella precedente e ci mette la nuova
    this.editPreferenza = (preferenza) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM proposta WHERE id = ?";
            db.get(sql, [preferenza.idProposta], (err, row) => {
                if(err) {
                    reject(err);
                } else if(row === undefined) {
                    reject(new PropostaNotFoundError());
                } else {
                    const sql = "SELECT * FROM preferenza WHERE idProposta = ? AND idUtente = ?";
                    db.get(sql, [preferenza.idProposta, preferenza.idUtente], (err, row) => {
                        if(err) {
                            reject(err);
                        } else if(row === undefined) {
                            reject(new PreferenzaNotFoundError());
                        } else {
                            const sql = "UPDATE preferenza SET valore = ? WHERE idProposta = ? AND idUtente = ?";
                            db.run(sql, [preferenza.valore, preferenza.idProposta, preferenza.idUtente], function(err) {
                                if(err) {
                                    reject(err);
                                } else {
                                    resolve(preferenza);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // restituisce le preferenze di una proposta
    this.getPreferenzeProposta = (idProposta) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM proposta WHERE id = ?";
            db.get(sql, [idProposta], (err, row) => {
                if(err) {
                    reject(err);
                } else if(row === undefined) {
                    reject(new PropostaNotFoundError());
                } else {
                    const sql = "SELECT * FROM preferenza WHERE idProposta = ?";
                    db.all(sql, [idProposta], (err, rows) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(mapRowsToPreferenze(rows));
                        }
                    });
                }
            });
        });
    };

    // // restituisce le preferenze espresse da un utente
    // this.getPreferenzeUtente = (idUtente) => {
    //     return new Promise((resolve, reject) => {
    //         const sql = "SELECT * FROM utente WHERE id = ?";
    //         db.get(sql, [idUtente], (err, row) => {
    //             if(err) {
    //                 reject(err);
    //             } else if(row === undefined) {
    //                 reject(new AuthenticationError());
    //             } else {
    //                 const sql = "SELECT * FROM preferenza WHERE idUtente = ?";
    //                 db.all(sql, [idUtente], (err, rows) => {
    //                     if(err) {
    //                         reject(err);
    //                     } else {
    //                         resolve(mapRowsToPreferenze(rows));
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // };

    // cancella tutte le preferenze
    this.deleteAllPreferenze = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM preferenza";
            db.run(sql, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve("Preferenze cancellate correttamente");
                }
            });
        });
    };

    // restituisce tutte le preferenze
    this.getListaPreferenze = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM preferenza";
            db.all(sql, [], (err, rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(mapRowsToPreferenze(rows));
                }
            });
        });
    };

    // cancella tutte le preferenze
    this.deleteAllPreferenze = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM preferenza";
            db.run(sql, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve("Preferenze cancellate correttamente");
                }
            });
        });
    };
};