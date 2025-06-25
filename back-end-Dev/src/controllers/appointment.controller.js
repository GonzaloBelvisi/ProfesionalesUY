const Appointment = require('../models/appointment.model');
const Profesional = require('../models/profesional.model');

// Verificar disponibilidad del profesional
const verificarDisponibilidad = async (professionalId, date, time) => {
    // Obtener el profesional
    const profesional = await Profesional.findById(professionalId);
    if (!profesional) {
        throw new Error('Profesional no encontrado');
    }

    // Verificar estado general de disponibilidad
    if (profesional.disponibilidad.estado !== 'disponible') {
        return false;
    }

    // Obtener el día de la semana
    const diaSemana = new Date(date).getDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaActual = diasSemana[diaSemana];

    // Verificar si el profesional trabaja ese día
    const horarioDia = profesional.disponibilidad.horarios.find(h => h.dia === diaActual);
    if (!horarioDia) {
        return false;
    }

    // Verificar si la hora está dentro del horario de trabajo
    const horaCita = time.split(':')[0];
    const horaInicio = horarioDia.horaInicio.split(':')[0];
    const horaFin = horarioDia.horaFin.split(':')[0];

    if (horaCita < horaInicio || horaCita > horaFin) {
        return false;
    }

    // Verificar si ya existe una cita en ese horario
    const citasExistentes = await Appointment.find({
        professional: professionalId,
        date: date,
        status: { $in: ['pending', 'confirmed'] }
    });

    const citaExistente = citasExistentes.find(cita => cita.time === time);
    if (citaExistente) {
        return false;
    }

    return true;
};

// Crear una nueva cita
const createAppointment = async (req, res) => {
    try {
        const { professional, date, time } = req.body;

        // Verificar disponibilidad
        const disponible = await verificarDisponibilidad(professional, date, time);
        if (!disponible) {
            return res.status(400).json({ 
                message: 'El profesional no está disponible en ese horario' 
            });
        }

        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todas las citas
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('client', 'name email')
            .populate('professional', 'name email');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una cita específica
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('client', 'name email')
            .populate('professional', 'name email');
        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Confirmar o rechazar una cita
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Validar que el status sea uno de los permitidos
        const statusPermitidos = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (req.body.status && !statusPermitidos.includes(req.body.status)) {
            return res.status(400).json({ 
                message: 'Status no válido. Debe ser uno de: ' + statusPermitidos.join(', ')
            });
        }

        // Actualizar los campos
        appointment.status = req.body.status;

        const citaActualizada = await appointment.save();

        res.status(200).json(citaActualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar una cita
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.status(200).json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener citas por cliente
const getAppointmentsByClient = async (req, res) => {
    try {
        const appointments = await Appointment.find({ client: req.params.clientId })
            .populate('professional', 'name email');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener citas por profesional
const getAppointmentsByProfessional = async (req, res) => {
    try {
        const appointments = await Appointment.find({ professional: req.params.professionalId })
            .populate('client', 'name email');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener horarios disponibles de un profesional
const getAvailableSlots = async (req, res) => {
    try {
        const { professionalId, date } = req.params;
        
        // Obtener el profesional
        const profesional = await Profesional.findById(professionalId);
        if (!profesional) {
            return res.status(404).json({ message: 'Profesional no encontrado' });
        }

        // Verificar estado general de disponibilidad
        if (profesional.disponibilidad.estado !== 'disponible') {
            return res.status(400).json({ 
                message: 'El profesional no está disponible en este momento' 
            });
        }

        // Obtener el día de la semana
        const diaSemana = new Date(date).getDay();
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaActual = diasSemana[diaSemana];

        // Obtener horario del día
        const horarioDia = profesional.disponibilidad.horarios.find(h => h.dia === diaActual);
        if (!horarioDia) {
            return res.status(400).json({ message: 'El profesional no trabaja ese día' });
        }

        // Obtener citas existentes
        const citasExistentes = await Appointment.find({
            professional: professionalId,
            date: date,
            status: { $in: ['pending', 'confirmed'] }
        });

        // Generar slots disponibles
        const horaInicio = parseInt(horarioDia.horaInicio.split(':')[0]);
        const horaFin = parseInt(horarioDia.horaFin.split(':')[0]);
        const slotsDisponibles = [];

        for (let hora = horaInicio; hora <= horaFin; hora++) {
            const timeSlot = `${hora.toString().padStart(2, '0')}:00`;
            const citaExistente = citasExistentes.find(cita => cita.time === timeSlot);
            
            if (!citaExistente) {
                slotsDisponibles.push(timeSlot);
            }
        }

        res.status(200).json({
            profesional: {
                nombre: profesional.nombre,
                apellido: profesional.apellido,
                profesion: profesional.profesion,
                especialidades: profesional.especialidades
            },
            fecha: date,
            horarioDisponible: {
                inicio: horarioDia.horaInicio,
                fin: horarioDia.horaFin
            },
            slotsDisponibles: slotsDisponibles,
            estadoDisponibilidad: profesional.disponibilidad.estado
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByClient,
    getAppointmentsByProfessional,
    getAvailableSlots
}; 