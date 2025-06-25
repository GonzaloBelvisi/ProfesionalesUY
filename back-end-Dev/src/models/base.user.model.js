const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const baseOptions = {
    discriminatorKey: 'tipo', // Campo que diferenciará entre tipos de usuario
    collection: 'usuarios'    // Todos los usuarios en la misma colección
};

const baseSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio']
    },
    ubicacion: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // Coordenadas por defecto (longitud, latitud)
        }
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    ...baseOptions
});

// Crear índice geoespacial
baseSchema.index({ ubicacion: '2dsphere' });

// Método para encriptar contraseña
baseSchema.pre('save', async function(next) {
    // Espía para depuración
    console.log('--- disparando hook pre-save para encriptar ---');
    console.log('¿La contraseña fue modificada?:', this.isModified('password'));

    if (!this.isModified('password')) return next();
    
    try {
        console.log('Contraseña antes de encriptar:', this.password);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Contraseña después de encriptar (hash):', this.password);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
baseSchema.methods.compararPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para no devolver la contraseña
baseSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const BaseUser = mongoose.model('BaseUser', baseSchema);

module.exports = { BaseUser, baseSchema }; 