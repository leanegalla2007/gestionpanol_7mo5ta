// src/config/db.js
const mysql = require('mysql2/promise'); // Con el '2' y '/promise'
require('dotenv').config();

// Creamos un único pool de conexiones con promesas
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: 'panol_db', // Ponemos directamente el nombre de tu base de datos actual
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación rápida de la conexión al arrancar
pool.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a MySQL (panol_db) mediante Promesas.');
        connection.release(); // Devolvemos la conexión al pool
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err.message);
    });

// Exportamos SOLO el pool para que lo usen tus modelos
module.exports = pool;