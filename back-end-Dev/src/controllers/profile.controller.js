const Cliente = require('../models/cliente.model');
const Profesional = require('../models/profesional.model');

// Obtener todos los clientes
const getAllClients = async (req, res) => {
    try {
        const clientes = await Cliente.find()
            .select('-password') // Excluimos la contraseña
            .sort({ createdAt: -1 }); // Ordenamos por fecha de creación, más recientes primero

        res.json({
            success: true,
            data: clientes
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener la lista de clientes',
            error: error.message
        });
    }
};

// Obtener todos los profesionales
const getAllProfessionals = async (req, res) => {
    try {
        const profesionales = await Profesional.find()
            .select('-password') // Excluimos la contraseña
            .sort({ promedioCalificacion: -1 }); // Ordenamos por calificación, mejor calificados primero

        res.json({
            success: true,
            data: profesionales
        });
    } catch (error) {
        console.error('Error al obtener profesionales:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener la lista de profesionales',
            error: error.message
        });
    }
};

// Obtener perfil de cliente
const getClientProfile = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id)
            .select('-password')
            .populate('historialServicios.servicio');

        if (!cliente) {
            return res.status(404).json({
                success: false,
                mensaje: 'Cliente no encontrado'
            });
        }

        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener el perfil del cliente',
            error: error.message
        });
    }
};

// Obtener perfil de profesional
const getProfessionalProfile = async (req, res) => {
    try {
        const profesional = await Profesional.findById(req.params.id)
            .select('-password')
            .populate('calificaciones.cliente', 'nombre apellido');

        if (!profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        res.json({
            success: true,
            data: profesional
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener el perfil del profesional',
            error: error.message
        });
    }
};

// Actualizar perfil de cliente
const updateClientProfile = async (req, res) => {
    try {
        const clienteActualizado = await Cliente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!clienteActualizado) {
            return res.status(404).json({
                success: false,
                mensaje: 'Cliente no encontrado'
            });
        }

        res.json({
            success: true,
            data: clienteActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar el perfil del cliente',
            error: error.message
        });
    }
};

// Actualizar perfil de profesional
const updateProfessionalProfile = async (req, res) => {
    try {
        const profesionalActualizado = await Profesional.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!profesionalActualizado) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        res.json({
            success: true,
            data: profesionalActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar el perfil del profesional',
            error: error.message
        });
    }
};

// Establecer horario del profesional
const setProfessionalSchedule = async (req, res) => {
    try {
        const profesional = await Profesional.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    'disponibilidad.horarios': req.body.horarios 
                } 
            },
            { new: true }
        );

        if (!profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        res.json({
            success: true,
            data: profesional.disponibilidad
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar el horario',
            error: error.message
        });
    }
};

// Obtener horario del profesional
const getProfessionalSchedule = async (req, res) => {
    try {
        const profesional = await Profesional.findById(req.params.id)
            .select('disponibilidad');

        if (!profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        res.json({
            success: true,
            data: profesional.disponibilidad
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener el horario',
            error: error.message
        });
    }
};

// Calificar a un profesional
const rateProfessional = async (req, res) => {
    try {
        const profesional = await Profesional.findById(req.params.id);

        if (!profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        const nuevaCalificacion = {
            cliente: req.body.clienteId,
            puntuacion: req.body.puntuacion,
            comentario: req.body.comentario
        };

        profesional.calificaciones.push(nuevaCalificacion);

        // Calcular nuevo promedio
        const totalPuntuaciones = profesional.calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0);
        profesional.promedioCalificacion = totalPuntuaciones / profesional.calificaciones.length;

        await profesional.save();

        res.json({
            success: true,
            mensaje: 'Calificación agregada exitosamente',
            data: {
                promedioCalificacion: profesional.promedioCalificacion,
                calificacion: nuevaCalificacion
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al calificar al profesional',
            error: error.message
        });
    }
};

// Obtener calificaciones de un profesional
const getProfessionalRatings = async (req, res) => {
    try {
        const profesional = await Profesional.findById(req.params.id)
            .select('calificaciones promedioCalificacion')
            .populate('calificaciones.cliente', 'nombre apellido');

        if (!profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Profesional no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                calificaciones: profesional.calificaciones,
                promedioCalificacion: profesional.promedioCalificacion
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener las calificaciones',
            error: error.message
        });
    }
};

// Buscar profesionales por profesión
const searchProfessionalsByProfession = async (req, res) => {
    try {
        const { profesion } = req.query;
        
        if (!profesion) {
            return res.status(400).json({
                success: false,
                mensaje: 'El parámetro profesión es requerido'
            });
        }

        // Buscar profesionales que coincidan con la profesión (búsqueda insensible a mayúsculas)
        const profesionales = await Profesional.find({
            profesion: { $regex: profesion, $options: 'i' }
        })
        .select('-password')
        .sort({ promedioCalificacion: -1 });

        res.json({
            success: true,
            data: profesionales,
            total: profesionales.length
        });
    } catch (error) {
        console.error('Error al buscar profesionales:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al buscar profesionales',
            error: error.message
        });
    }
};

module.exports = {
    getAllClients,
    getAllProfessionals,
    getClientProfile,
    getProfessionalProfile,
    updateClientProfile,
    updateProfessionalProfile,
    setProfessionalSchedule,
    getProfessionalSchedule,
    rateProfessional,
    getProfessionalRatings,
    searchProfessionalsByProfession
};