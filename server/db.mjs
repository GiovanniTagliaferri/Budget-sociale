import sqlite3 from 'sqlite3';

const db_path = './';
const db = new sqlite3.Database(db_path + 'database.db', (err) => {
    if(err) throw err;
});

export default db;
