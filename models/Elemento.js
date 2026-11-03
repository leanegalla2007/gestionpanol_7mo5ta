// src/models/Elemento.js
const db = require('../config/db');

class Elemento {
    // 1. Obtener todos los elementos del pañol
    static async getAll() {
        try {
            const sql = `
            SELECT 
                *,
                (cantidad_total - COALESCE(cant_reparacion, 0)) AS estado
            FROM elementos
        `;
            const [rows] = await db.query(sql);
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
    static async create(datos) {
        try {
            // Aseguramos valores por defecto por si alguna propiedad no viene en el objeto
            const nombre = datos.nombre || datos.nombre_objeto;
            const categoria = datos.categoria || '';
            const cantidad_total = parseInt(datos.cantidad_total) || 0;
            const cant_reparacion =parseInt(datos.cant_reparacion) || 0;
            const stock_minimo = parseInt(datos.stock_minimo) || 0;
            const estado = datos.estado || 'Disponible';
            const fecha_reparacion = datos.fecha_reparacion;


            if (!nombre) {
                throw new Error("El campo 'nombre' es requerido.");
            }

            const sql = 'INSERT INTO elementos (nombre, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, fecha_reparacion) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [nombre, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, fecha_reparacion]);
            
            return { id: result.insertId, nombre, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, fecha_reparacion };
        } catch (error) {
            throw new Error('Error al crear el elemento: ' + error.message);
        }
    }

    // 4. Actualizar el estado de un elemento (ej: de 'Disponible' a 'En Reparación')
    static async updateStockYEstado(id, nuevoStock, nuevoEstado) {
        try {
            const sql = "UPDATE elementos SET cantidad_total = ?, estado = ?, fecha_reparacion = ? WHERE id = ?";
            await db.query(sql, [id, nuevoStock, nuevoEstado, fecha_reparacion]);
            return { id, cantidad_total:nuevoStock, estado: nuevoEstado, fecha_reparacion };
        } catch (error) {
            throw new Error('Error al actualizar el estado del elemento: ' + error.message);
        }
    }

    static async actualizarStock(id, datosStock) {
        try {
            const { nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion = 0, fecha_reparacion } = datosStock;
            const sql = "UPDATE elementos SET nombre = ?, categoria = ?, cantidad_total = ?, stock_minimo = ?, estado = ?, cant_reparacion = ?, fecha_reparacion = ? WHERE id = ?";
            const [result] = await db.query(sql, [nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion, fecha_reparacion, id]);

            return result;
        } catch (error) {
            throw new Error('Error al actualizar el elemento: ' + error.message);
        }
    }
}


module.exports = Elemento;