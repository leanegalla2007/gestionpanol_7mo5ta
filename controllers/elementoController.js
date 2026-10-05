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
        const { nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion = 0 } = req.body;

        const sql = `
            UPDATE elementos 
            SET nombre = ?, categoria = ?, cantidad_total = ?, stock_minimo = ?, estado = ?, cant_reparacion = ?
            WHERE id = ?
        `;

        // Intentamos ejecutarlo como Promesa (mysql2/promise)
        if (db.promise || typeof db.query.then === 'function') {
            await db.query(sql, [nombre, categoria, cantidad_total, stock_minimo, estado, id]);
            console.log("--> [PROMISE] BD Actualizada correctamente");
            return res.status(200).json({ message: 'Elemento actualizado correctamente' });
        } 
        
        // Si no es promesa, usamos Callback tradicional
        db.query(sql, [nombre, categoria, cantidad_total, stock_minimo, estado, cant_reparacion, id], (err, result) => {
            if (err) {
                console.error("Error SQL:", err);
                return res.status(500).json({ error: err.message });
            }
            console.log("--> [CALLBACK] BD Actualizada correctamente");
            return res.status(200).json({ message: 'Elemento actualizado correctamente' });
        });

    } catch (error) {
        console.error("Error en actualizarElemento:", error);
        return res.status(500).json({ error: error.message });
    }
}
};

module.exports = elementoController;