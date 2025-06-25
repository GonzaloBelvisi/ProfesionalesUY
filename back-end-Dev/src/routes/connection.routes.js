const express = require('express');
const router = express.Router();
const {
    createConnection,
    getClientConnections,
    deleteConnection,
    checkConnection
} = require('../controllers/connection.controller');

// Crear una nueva conexión
router.post('/crear', createConnection);

// Obtener todas las conexiones de un cliente
router.get('/cliente/:clienteId', getClientConnections);

// Eliminar una conexión
router.delete('/:connectionId', deleteConnection);

// Verificar si existe una conexión
router.get('/verificar', checkConnection);

module.exports = router; 