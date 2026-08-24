const express = require("express");
const router = express.Router();
const docenteController = require("../controllers/docenteController");
const elementoController = require("../controllers/elementoController");
const prestamoController = require("../controllers/prestamoController")

//seccion de docentes
router.get("/docentes", docenteController.getAllDocentes);
router.post("/docentes", docenteController.createDocente);

//seccion de elemento
router.get("/elementos", elementoController.getAllElementos);
router.get("/elementos/:id", elementoController.getElementoById);
router.post("/elementos", elementoController.createElemento);
router.put("/elementos/:id", elementoController.updateEstadoElemento);
router.post("/elementos/:id", elementoController.editarElemento);

//seccion de prestamos
router.get("/prestamos/activos", prestamoController.getPrestamosActivos);
router.get("/prestamos/historial", prestamoController.getHistorialPrestamos);
router.post("/prestamos", prestamoController.crearPrestamo);
router.put("/prestamos/:id/devolucion", prestamoController.devolverPrestamo);

module.exports = router;