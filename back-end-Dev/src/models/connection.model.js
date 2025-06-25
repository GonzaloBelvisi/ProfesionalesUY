const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    profesional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profesional',
        required: true
    },
    fechaConexion: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['activa', 'inactiva'],
        default: 'activa'
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar conexiones duplicadas
connectionSchema.index({ cliente: 1, profesional: 1 }, { unique: true });

// Índice para búsquedas eficientes
connectionSchema.index({ cliente: 1, estado: 1 });
connectionSchema.index({ profesional: 1, estado: 1 });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection; 