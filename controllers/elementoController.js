// src/controllers/elementoController.js
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
            // Recibimos los datos del formulario (desde el body de la petición)
            const { nombre, categoria, cantidad_total, stock_minimo } = req.body;

            // Validación básica de campos obligatorios
            if (!nombre || !categoria || !cantidad_total || !stock_minimo) {
                return res.status(400).json({ message: 'El campo faltante es obligatorio' });
            }

            const nuevoElemento = await Elemento.create(nombre, categoria, cantidad_total, stock_minimo);
            res.status(201).json({
                message: 'Elemento creado con éxito',
                elemento: nuevoElemento
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 4. Cambiar estado (ej: marcar como 'En Reparación')
    updateEstadoElemento: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            if (!estado) {
                return res.status(400).json({ message: 'El nuevo estado es requerido' });
            }

            const elementoActualizado = await Elemento.updateEstado(id, estado);
            res.status(200).json({
                message: 'Estado actualizado correctamente',
                elemento: elementoActualizado
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    editarElemento: (req, res) => {

        const nombre = req.body.nombre;
        const categoria = req.body.categoria || null;
        const cantidad = req.body.cantidad_total === '' || req.body.cantidad_total == null ? null : req.body.cantidad_total
        const minstock = req.body.stock_minimo === '' || req.body.stock_minimo == null ? null : req.body.stock_minimo

        if (!nombre) return res.status(401).send('Falta el NOMBRE del elemento.');
        if (!categoria) return res.status(401).send('Falta la CATEGORIA del elemento.');
        if (!cantidad) return res.status(401).send('Falta la CANTIDAD del elemento.');
        if (!minstock) return res.status(401).send('Falta el STOCK MINIMO del elemento.');


    }
};

module.exports = elementoController;