const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require ('dotenv').config();
 // Importas tus rutas separadas
const stockRoutes = require("./routes/panolRoutes");
const PORT = process.env.PORT || 3000;

const app = express();

// Habilita el parseo de JSON para recibir datos en el body
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conectas las rutas al servidor
app.use("/", stockRoutes);

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123",
    database: "panol_db"
});
