let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('myDB');

//create database
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, fname TEXT, sname TEXT, email TEXT, date TEXT NOT NULL, q1 INTEGER, q2 INTEGER, q3 INTEGER, colour TEXT, comment TEXT)");
    db.run("DELETE FROM User");

    console.log('New database cleared');

     db.run(`INSERT INTO User (fname, sname, email, date, q1, q2, q3, colour, comment) 
        VALUES ("su","leong", "email1", "1/24", "2", "2","5","blue","A butterfly landed on me")`,)
});
  db.close();