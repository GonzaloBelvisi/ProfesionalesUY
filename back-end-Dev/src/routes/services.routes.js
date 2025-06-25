const express = require('express');
const router = express.Router();

// Rutas para gestión de servicios profesionales
router.post('/crear', /* TODO: createService */);
router.get('/listar', /* TODO: getAllServices */);
router.get('/categoria/:categoria', /* TODO: getServicesByCategory */);
router.get('/profesional/:id', /* TODO: getServicesByProfessional */);
router.put('/actualizar/:id', /* TODO: updateService */);
router.delete('/eliminar/:id', /* TODO: deleteService */);
router.get('/buscar', /* TODO: searchServices */);

module.exports = router; 