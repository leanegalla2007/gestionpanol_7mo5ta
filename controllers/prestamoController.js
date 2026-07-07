// src/controllers/prestamoController.js
const Prestamo = require('../models/Prestamo');
const Elemento = require('../models/Elemento');

const prestamoController = {
    // Ver lo que está afuera actualmente
    getPrestamosActivos: async (req, res) => {
        try {
            const activos = await Prestamo.getAllActivos();
            res.status(200).json(activos);
        } catch (error) {
            console.error("no se pudo conectar", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // Ver todo el historial
    getHistorialPrestamos: async (req, res) => {
        try {
            const historial = await Prestamo.getHistorial();
            res.status(200).json(historial);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Acción de Prestar un elemento
    crearPrestamo: async (req, res) => {
        try {
            const { id_docente, id_elemento, observaciones } = req.body;

            if (!docente_id || !elemento_id) {
                return res.status(400).json({ message: 'Docente y Elemento son requeridos.' });
            }

            // 1. Verificar si el elemento está disponible
            const elemento = await Elemento.getById(id_elemento);
            if (!elemento || elemento.estado !== 'Disponible') {
                return res.status(400).json({ message: 'El elemento no está disponible para préstamo.' });
            }

            // 2. Crear el registro del préstamo
            await Prestamo.create(id_docente, id_elemento, observaciones);

            // 3. Cambiar el estado del elemento a 'Prestado'
            await Elemento.updateEstado(id_elemento, 'Prestado');

            res.status(201).json({ message: 'Préstamo registrado con éxito.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Acción de Devolver un elemento
    devolverPrestamo: async (req, res) => {
        try {
            const { id } = req.params; // ID del préstamo
            const { elemento_id } = req.body; // Necesitamos el ID del elemento para volver a ponerlo disponible

            if (!elemento_id) {
                return res.status(400).json({ message: 'El ID del elemento es requerido para la devolución.' });
            }

            // 1. Finalizar el préstamo
            const finalizado = await Prestamo.finalizar(id);
            if (!finalizado) {
                return res.status(404).json({ message: 'No se encontró el préstamo especificado.' });
            }

            // 2. Volver a poner el objeto como 'Disponible'
            await Elemento.updateEstado(elemento_id, 'Disponible');

            res.status(200).json({ message: 'Devolución procesada correctamente.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = prestamoController;