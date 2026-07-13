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
            console.log("DEBUG BACKEND -> Datos recibidos en req.body:", req.body);
            const { id_docentes, id_elementos, observaciones, cantidad } = req.body;

            if (!id_docentes || !id_elementos) {
                return res.status(400).json({ message: 'Docente y Elemento son requeridos.' });
            }

            // 1. Verificar si el elemento está disponible
            const elemento = await Elemento.getById(id_elementos);
            if (elemento.estado === 'Prestado' || elemento.cantidad_total <= 0) {
                return res.status(400).json({ message: 'El elemento no está disponible para préstamo.' });
            }
            console.log("DEBUG BACKEND -> Elemento traído de la BD:", elemento);

            if (elemento.cantidad_total < cantidad) {
                return res.status(400).json({message: `Solo queda ${elemento.cantidad_total} unidades`})
            }

            // 2. Crear el registro del préstamo
            await Prestamo.create({ id_docentes, id_elementos, observaciones, cantidad });

            const nuevoStock = elemento.cantidad_total - cantidad;

            const nuevoEstado = nuevoStock === 0? 'Prestado' : 'Disponible';

            await Elemento.updateStockYEstado(id_elementos, nuevoStock, nuevoEstado);
            res.status(201).json({message: 'Prestamo registrado con exito.'});
         

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Acción de Devolver un elemento
    devolverPrestamo: async (req, res) => {
        try {
            const { id } = req.params; // ID del préstamo
            const { id_elementos } = req.body; // Necesitamos el ID del elemento para volver a ponerlo disponible
            
            if (!id_elementos) {
                return res.status(400).json({ message: 'El ID del elemento es requerido para la devolución.' });
            }
            
            const prestamo = await Prestamo.getById(id);
            if (!prestamo) {
                return res.status(404).json({message: 'no se encontro el registo del prestamo.' });
            }

            const elemento = await Elemento.getById(id_elementos);
            if (!elemento) {
                return res.status(404).json({message: 'El elemento no existe.' });
            }

            const nuevoStock = elemento.cantidad_total + prestamo.cantidad;

            
            console.log("Datos recibidos para devolución -> ID Préstamo:", id, "| ID Elemento:", id_elementos);
            // 1. Finalizar el préstamo
            const finalizado = await Prestamo.finalizar(id);
            if (!finalizado) {
                return res.status(404).json({ message: 'No se encontró el préstamo especificado.' });
            }
            
            // 2. Volver a poner el objeto como 'Disponible'
            await Elemento.updateStockYEstado(id_elementos, nuevoStock, 'Disponible');

            res.status(200).json({ message: 'Devolución procesada correctamente.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = prestamoController;