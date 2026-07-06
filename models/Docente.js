// src/models/Docente.js
const db = require('../config/db');

class Docente {
    // Obtener todos los docentes
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM docentes ORDER BY apellido, nombre, dni, turno');
            return rows;
        } catch (error) {
            throw new Error('Error al obtener los docentes: ' + error.message);
        }
    }

    // Buscar un docente por su ID
    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM docentes WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Error al obtener el docente: ' + error.message);
        }
    }

    // Registrar un nuevo docente
    static async create(nombre, apellido, dni, turno) {
        try {
            const sql = 'INSERT INTO docentes (nombre, apellido, dni, turno) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sql, [nombre, apellido, dni, turno]);
            return { id: result.insertId, nombre, apellido, dni, turno };
        } catch (error) {
            throw new Error('Error al crear el docente: ' + error.message);
        }
    }
}

module.exports = Docente;