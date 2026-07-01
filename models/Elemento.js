// src/models/Elemento.js
const db = require('../config/db');

class Elemento {
    // 1. Obtener todos los elementos del pañol
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM elementos');
            return rows;
        } catch (error) {
            throw new Error('Error al obtener los elementos: ' + error.message);
        }
    }

    // 2. Obtener un elemento específico por su ID
    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM elementos WHERE id = ?', [id]);
            return rows[0] || null; // Devuelve el elemento o null si no existe
        } catch (error) {
            throw new Error('Error al obtener el elemento: ' + error.message);
        }
    }

    // 3. Insertar un nuevo elemento al inventario (tizas, proyectores, etc.)
    static async create(nombre, categoria, cantidad_total, estado = 'Disponible') {
        try {
            const sql = 'INSERT INTO elementos (nombre, categoria, cantidad_total, estado) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sql, [nombre, categoria, cantidad_total, estado]);
            return { id: result.insertId, nombre, categoria, cantidad_total,  estado };
        } catch (error) {
            throw new Error('Error al crear el elemento: ' + error.message);
        }
    }

    // 4. Actualizar el estado de un elemento (ej: de 'Disponible' a 'En Reparación')
    static async updateEstado(id, nuevoEstado) {
        try {
            const sql = 'UPDATE elementos SET estado = ? WHERE id = ?';
            await db.query(sql, [nuevoEstado, id]);
            return { id, estado: nuevoEstado };
        } catch (error) {
            throw new Error('Error al actualizar el estado del elemento: ' + error.message);
        }
    }
}

module.exports = Elemento;