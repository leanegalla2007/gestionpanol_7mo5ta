const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const panolRoutes = require("./routes/panolRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la Base de Datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "panol_db"
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
  } else {
    console.log("Conectado exitosamente a la base de datos MySQL");
  }
});

// Middlewares
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public')); 
// Si elementos.html está en la raíz del proyecto (fuera de public), usa esta línea en su lugar:
// app.use(express.static(__dirname));

// Ruta principal para que abra elementos.html al entrar a http://localhost:3000
app.get('/', (req, res) => {
  // Ajusta la ruta si elementos.html no está dentro de 'public'
  res.sendFile(path.join(__dirname, 'public', 'elementos.html'));
});

// Rutas de la API
app.use("/api", panolRoutes);

// Iniciar servidor usando la constante PORT
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));