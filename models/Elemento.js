// src/models/Elemento.js
const db = require('../config/db');
const { param } = require('../routes/panolRoutes');

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
            const marca = datos.marca
            const categoria = datos.categoria || '';
            const cantidad_total = parseInt(datos.cantidad_total) || 0;
            const cant_reparacion =parseInt(datos.cant_reparacion) || 0;
            const stock_minimo = parseInt(datos.stock_minimo) || 0;
            const estado = datos.estado || 'Disponible';
            const motivo = datos.motivo;
            const recomendacion = datos.recomendacion;
            const fecha_compra = datos.fecha_compra;
            const fecha_reparacion = datos.fecha_reparacion;


            if (!nombre) {
                throw new Error("El campo 'nombre' es requerido.");
            }

            const sql = 'INSERT INTO elementos (nombre, marca, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, motivo, recomendacion, fecha_reparacion, fecha_compra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const [result] = await db.query(sql, [nombre, marca, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, motivo, recomendacion, fecha_reparacion, fecha_compra]);
            
            return { id: result.insertId, nombre, marca, categoria, cantidad_total, cant_reparacion, stock_minimo, estado, motivo, recomendacion, fecha_reparacion, fecha_compra };
        } catch (error) {
            throw new Error('Error al crear el elemento: ' + error.message);
        }
    }

    // 4. Actualizar el estado de un elemento (ej: de 'Disponible' a 'En Reparación')
    // 4. Cambiar estado (ej: de 'Disponible' a 'En Reparación' o viceversa)
    static async updateStockYEstado(id, nuevoStock, nuevoEstado, fecha_reparacion = null) {
        try {
            let sql, params;

            // Si se envió una fecha (por ejemplo, al mandar a reparación)
            if (fecha_reparacion !== null) {
                sql = "UPDATE elementos SET cantidad_total = ?, estado = ?, fecha_reparacion = ? WHERE id = ?";
                params = [nuevoStock, nuevoEstado, fecha_reparacion, id];
            } else {
                // Si NO se envió fecha (como en las devoluciones donde pasa a 'Disponible'), 
                // actualizamos el stock y el estado, y limpiamos la fecha de reparación a NULL.
                sql = "UPDATE elementos SET cantidad_total = ?, estado = ?, fecha_reparacion = NULL WHERE id = ?";
                params = [nuevoStock, nuevoEstado, id];
            }

            await db.query(sql, params);
            return { id, cantidad_total: nuevoStock, estado: nuevoEstado };
        } catch (error) {
            throw new Error('Error al actualizar el estado del elemento: ' + error.message);
        }
    }
    
    static async actualizarStock(id, datosStock) {
        try {
            const { nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion = 0, fecha_reparacion } = datosStock;
            let sql, params;
            if (fecha_reparacion !== undefined) {
                sql = "UPDATE elementos SET nombre = ?, categoria = ?, cantidad_total = ?, stock_minimo = ?, estado = ?, cant_reparacion = ?, fecha_reparacion = ? WHERE id = ?";
                params = [nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion, fecha_reparacion, id]
            } else {
                sql = "UPDATE elementos SET nombre = ?, categoria = ?, cantidad_total = ?, stock_minimo = ?, estado = ?, cant_reparacion = ?, WHERE id = ?";
                params = [nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion, id]
            }
            const [result] = await db.query(sql, params);

            return result;
        } catch (error) {
            throw new Error('Error al actualizar el elemento: ' + error.message);
        }
    }
}


module.exports = Elemento;