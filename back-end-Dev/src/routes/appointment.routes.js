const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// Rutas de citas
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

// Rutas específicas para clientes y profesionales
router.get('/client/:clientId', appointmentController.getAppointmentsByClient);
router.get('/professional/:professionalId', appointmentController.getAppointmentsByProfessional);

// Ruta para obtener horarios disponibles
router.get('/available-slots/:professionalId/:date', appointmentController.getAvailableSlots);

module.exports = router; 

//const express = require('express');
//const router = express.Router();
//
//// Rutas para gestión de citas
//router.post('/agendar', /* TODO: createAppointment */);
//router.get('/cliente/:id', /* TODO: getClientAppointments */);
//router.get('/profesional/:id', /* TODO: getProfessionalAppointments */);
//router.put('/actualizar/:id', /* TODO: updateAppointment */);
//router.delete('/cancelar/:id', /* TODO: cancelAppointment */);
//router.get('/disponibilidad/:profesionalId', /* TODO: checkAvailability */);
//router.put('/confirmar/:id', /* TODO: confirmAppointment */);
//
//module.exports = router;