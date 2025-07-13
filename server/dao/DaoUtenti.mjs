import db from '../db.mjs';
import crypto from "crypto";

export function Utente(id, username, nome, cognome, email, password, ruolo) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.username = username;
    this.password = password;
    this.ruolo = ruolo;
};

function mapRowsToUtenti(rows) {
    return rows.map((row) => {
        return new Utente(row.id, row.username, row.nome, row.cognome, row.email, row.password, row.ruolo);
    });
};

export default function UtentiDAO() {
    // restituisce un utente dato l'id
    this.getUtente = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM utente WHERE id = ?";
            db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row) {
                    reject({err: "Utente non trovato"});
                } else {
                    resolve(mapRowsToUtenti([row])[0]);
                }
            });
        });
    };

    // restituisce un utente dato l'username e password
    this.getUtenteDaCredenziali = (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM utente WHERE username = ?";
            db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                }
                else {
                    const user = { id: row.id, username: row.username, nome: row.nome, cognome: row.cognome, email: row.email, ruolo: row.ruolo };
                    crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
                        if (err) reject(err);
                        if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
                            resolve(false);
                        else
                            resolve(user);
                    });
                }
            });
        });
    };

    // restituisce (id, username) di tutti gli utenti
    this.getUtenti = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT id, username FROM utente";
            db.all(sql, [], (err, rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(mapRowsToUtenti(rows));
                }
            });
        });
    };
};