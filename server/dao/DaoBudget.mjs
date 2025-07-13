import db from "../db.mjs";
import { BudgetNotFoundError, BudgetAlreadyExistsError } from "../errori.mjs";

export function Budget(id, valore) {
    this.id = id;
    this.valore = valore;
}

function mapRowsToBudget(rows) {
    return rows.map((row) => {
        return new Budget(row.id, row.valore);
    });
}

export default function BudgetDAO() {
    // crea il budget se non esiste
    this.createBudget = (budget) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM budget";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err);
                } else if(row) {
                    reject(new BudgetAlreadyExistsError);
                } else {
                    const sql = "INSERT INTO budget (valore) VALUES (?)";
                    db.run(sql, [budget.valore], function(err) {
                        if(err) {
                            reject(err);
                        } else {
                            budget.id = this.lastID;
                            resolve(budget);
                        }
                    });
                }
            });
        });
    };

    // restituisce il budget
    this.getBudget = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM budget";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err);
                } else if(row) {
                    resolve(new Budget(row.id, row.valore));
                } else {
                    reject(new BudgetNotFoundError());
                }
            });
        });
    };

    // cancella il budget
    this.deleteBudget = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM budget";
            db.run(sql, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
};