// src/models/Prestamo.js
const db = require('../config/db');

class Prestamo {
    // 1. Obtener solo préstamos ACTIVOS (lo que está afuera del pañol ahora)
    static async getById(id){ 
    try{
        const sql = 'SELECT * FROM prestamos WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Error al obtener el prestamo: ' + error.message);
    }
    }

    static async getAllActivos() {
        try {
            const sql = `
                SELECT p.id, p.id_elementos, p.id_docentes, p.fechayhora_salida, p.observaciones, p.estado,
                       d.nombre AS docente_nombre, d.apellido AS docente_apellido,
                       e.nombre AS elemento_nombre, e.categoria AS elemento_categoria
                FROM prestamos p
                JOIN docentes d ON p.id_docentes = d.id
                JOIN elementos e ON p.id_elementos = e.id
                WHERE p.estado = 'Activo'
                ORDER BY p.fechayhora_salida DESC`;
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw new Error('Error al obtener préstamos activos: ' + error.message);
        }
    }

    // 2. Obtener el HISTORIAL completo (todos los préstamos)
    static async getHistorial() {
        try {
            const sql = `
                SELECT p.id, p.fechayhora_salida, p.fechayhora_devolucion, p.estado, p.observaciones,
                       d.nombre AS docente_nombre, d.apellido AS docente_apellido,
                       e.nombre AS elemento_nombre
                FROM prestamos p
                JOIN docentes d ON p.id_docentes = d.id
                JOIN elementos e ON p.id_elementos = e.id
                ORDER BY p.fechayhora_salida DESC`;
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw new Error('Error al obtener el historial: ' + error.message);
        }
    }

    // 3. Registrar un nuevo préstamo
    static async create({ id_docentes, id_elementos, observaciones = '', cantidad = '1' }) {
        try {
            const sql = "INSERT INTO prestamos (id_docentes, id_elementos, observaciones, cantidad, estado) VALUES (?, ?, ?, ?, 'Activo')";
            const [result] = await db.query(sql, [id_docentes, id_elementos, observaciones, cantidad]);
            return result.insertId;
        } catch (error) {
            throw new Error('Error al registrar préstamo: ' + error.message);
        }
    }

    // 4. Finalizar un préstamo (Devolución)
    static async finalizar(id) {
        try {
            const sql = `UPDATE prestamos 
                         SET estado = 'Devuelto', fechayhora_devolucion = CURRENT_TIMESTAMP 
                         WHERE id = ?`;
            const [result] = await db.query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al finalizar el préstamo: ' + error.message);
        }
    }
}

module.exports = Prestamo;