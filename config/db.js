const mysql = require("mysql2");
require('dotenv').config();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "panol_db"
});

db.connect((err) => {
  if (err) console.error("Error conectando a la BD: ", err);
  else console.log("Conectado a MySQL");
});


// Creamos un pool de conexiones (es más eficiente que una conexión única)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool usando la API de promesas (async/await)
const poolPromise = pool.promise();

// Verificación inicial de la conexión al arrancar
poolPromise.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a la base de datos MySQL en phpMyAdmin.');
        connection.release(); // Liberamos la conexión de vuelta al pool
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err.message);
    });

module.exports = poolPromise;
module.exports = db;