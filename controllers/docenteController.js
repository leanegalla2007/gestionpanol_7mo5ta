// src/controllers/docenteController.js
const Docente = require('../models/Docente');

const docenteController = {
    getAllDocentes: async (req, res) => {
        try {
            const docentes = await Docente.getAll();
            res.status(200).json(docentes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createDocente: async (req, res) => {
        try {
            console.log("-> BODY RECIBIDO EN DOCENTES:", req.body);

            const { nombre, apellido, dni, turno, curso } = req.body;

            // 1. Validamos PRIMERO que no falte ningún dato
            if (!nombre || !apellido || !dni || !turno || !curso) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            }

            // 2. Guardamos UNICAMENTE UNA VEZ usando req.body
            const nuevoDocente = await Docente.create({ nombre, apellido, dni, turno, curso });

            // 3. Respondemos con status 201
            return res.status(201).json({ message: 'Docente registrado con éxito', docente: nuevoDocente });

        } catch (error) {
            console.error("🔴 ERROR EXACTO AL CREAR DOCENTE:", error);
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = docenteController;