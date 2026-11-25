// src/controllers/elementoController.js
const db = require('../config/db');
const Elemento = require('../models/Elemento');

const elementoController = {
    // 1. Listar todos los elementos
    getAllElementos: async (req, res) => {
        try {
            const elementos = await Elemento.getAll();
            return res.status(200).json(elementos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // 2. Obtener un solo elemento por su ID
    getElementoById: async (req, res) => {
        try {
            const { id } = req.params;
            const elemento = await Elemento.getById(id);
            
            if (!elemento) {
                return res.status(404).json({ message: 'Elemento no encontrado' });
            }
            
            res.status(200).json(elemento);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Crear un nuevo elemento (Agregar al stock)
createElemento: async (req, res) => {
        try {
            console.log("Datos recibidos en req.body:", req.body);

            // Pasamos el objeto req.body completo al modelo
            const nuevoElemento = await Elemento.create(req.body);

            return res.status(201).json({
                message: 'Elemento creado con éxito',
                elemento: nuevoElemento
            });
        } catch (error) {
            console.error("Error en createElemento:", error);
            return res.status(500).json({ error: error.message });
        }
    },

    // 4. Cambiar estado (ej: marcar como 'En Reparación')
    // Reemplazá el controlador que dispara el error 500 por este método unificado:
updateEstadoElemento: async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, categoria, cantidad_total, motivo, recomendacion_por, stock_minimo, estado, cant_reparacion = 0, fecha_reparacion, fecha_compra } = req.body;

        const sql = `
            UPDATE elementos 
            SET nombre = ?, marca = ?, categoria = ?, cantidad_total = ?, motivo = ?, recomendacion_por = ?, stock_minimo = ?, estado = ?, cant_reparacion = ?, fecha_reparacion = ?, fecha_compra = ?
            WHERE id = ?
        `;
    const parametros = [nombre, marca, categoria, cantidad_total, motivo, recomendacion_por, stock_minimo, estado, cant_reparacion, fecha_reparacion, fecha_compra, id];

    await db.query(sql, parametros);
    
    return res.status(200).json({message: 'Elemento actualizado correctamente'});
    } catch (error) {
        console.error("Error en actualizarElemento:", error);
        return res.status(500).json({ error: error.message });
    }
},

// En tu elementoController.js
cambiarAReparacion: async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoStock } = req.body; // O como recibas los datos

        // 1. Generamos la fecha y hora exacta actual
        const fechaActual = new Date().toISOString().slice(0, 19).replace("T", " ");

        // 2. Llamamos al modelo pasándole la fecha junto con los demás datos
        await Elemento.updateStockYEstado(id, nuevoStock, 'Reparacion', fechaActual);

        return res.status(200).json({ message: 'Enviado a reparación correctamente' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
},

getCompras: async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM elementos ORDER BY fecha_compra DESC');
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener compras:", error);
        return res.status(500).json({ error: error.message });
    }
},
createCompra: async (req, res) => {
    const {
        nombre,
        marca,
        categoria,
        motivo,
        recomendacion_por,
        precio,
        cantidad_total,
        stock_minimo,
        cant_reparacion = 0,
        estado = 'Disponible'
    } = req.body;

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre del elemento es obligatorio.' });
    }

    const nombreLimpio = nombre.trim();
    const marcaLimpia = (marca && marca.trim()) ? marca.trim() : 'Sin marca';
    const cantidadComprada = parseInt(cantidad_total, 10) || 0;
    const stockMin = parseInt(stock_minimo, 10) || 0;
    const cantRep = parseInt(cant_reparacion, 10) || 0;
    const precioNum = parseFloat(precio) || 0;
    const recomendacion = motivo === 'Recomendacion' ? (recomendacion_por || null) : null;

    let elementoId;
    let conn;
    try {
        if (typeof db.getConnection === 'function') {
            conn = await db.getConnection();
            await conn.beginTransaction();
        }
        const runner = conn || db;

        const [existentes] = await runner.query(
            'SELECT id, cantidad_total FROM elementos WHERE LOWER(nombre) = LOWER(?) AND LOWER(marca) = LOWER(?) LIMIT 1',
            [nombreLimpio, marcaLimpia]
        );

        if (existentes && existentes.length > 0) {
            elementoId = existentes[0].id;
            const stockActual = parseInt(existentes[0].cantidad_total, 10) || 0;
            const nuevoStock = stockActual + cantidadComprada;

            await runner.query(
                `UPDATE elementos
                 SET cantidad_total = ?,
                     stock_minimo = ?,
                     precio = ?,
                     motivo = ?,
                     recomendacion_por = ?,
                     categoria = COALESCE(?, categoria)
                 WHERE id = ?`,
                [
                    nuevoStock,
                    stockMin,
                    precioNum,
                    motivo || 'Falta de stock',
                    recomendacion || '-',
                    categoria || null,
                    elementoId
                ]
            );
        } else {
            const [insertElem] = await runner.query(
                `INSERT INTO elementos
                    (nombre, marca, categoria, motivo, recomendacion_por, precio, cantidad_total, stock_minimo, cant_reparacion, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nombreLimpio,
                    marcaLimpia,
                    categoria || 'Otros',
                    motivo || 'Falta de stock',
                    recomendacion || '-',
                    precioNum,
                    cantidadComprada,
                    stockMin,
                    cantRep,
                    estado
                ]
            );
            elementoId = insertElem.insertId;
        }

        if (conn) {
            await conn.commit();
        }

        return res.status(201).json({
            message: 'Compra registrada y stock actualizado con éxito.',
            id: elementoId
        });
    } catch (error) {
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
        }
        console.error('Error en createCompra:', error);
        return res.status(500).json({ error: error.message || 'Error al registrar la compra.' });
    } finally {
        if (conn && typeof conn.release === 'function') {
            conn.release();
        }
    }
}
};

module.exports = elementoController;