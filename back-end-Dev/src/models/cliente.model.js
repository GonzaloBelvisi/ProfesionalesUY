const mongoose = require('mongoose');
const { BaseUser } = require('./base.user.model');

const clienteSchema = new mongoose.Schema({
    direccion: {
        calle: String,
        numero: String,
        ciudad: String,
        codigoPostal: String
    },
    historialCitas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cita'
    }],
    historialServicios: [{
        servicio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Servicio'
        },
        fecha: Date,
        estado: {
            type: String,
            enum: ['pendiente', 'en_proceso', 'completado', 'cancelado']
        }
    }],
    direccionesFavoritas: [{
        nombre: String,
        ubicacion: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: [Number]
        }
    }],
    metodoPago: [{
        tipo: {
            type: String,
            enum: ['tarjeta', 'efectivo']
        },
        detalles: mongoose.Schema.Types.Mixed
    }]
});

const Cliente = BaseUser.discriminator('Cliente', clienteSchema);

module.exports = Cliente; 