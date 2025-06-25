const { BaseUser } = require('../models/base.user.model');
const Cliente = require('../models/cliente.model');
const Profesional = require('../models/profesional.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const registroCliente = async (req, res) => {
    try {
        const { email, password, nombre, direccion, direccionesFavoritas, apellido, telefono, metodoPago } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Cliente.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }

        // Crear el nuevo cliente
        const cliente = await Cliente.create({
            email,
            password,
            nombre,
            direccion,
            direccionesFavoritas: direccionesFavoritas || [],
            apellido,
            telefono,
            metodoPago: metodoPago || []
            // ubicacion se maneja automáticamente con el valor por defecto
        });

        res.status(201).json({
            success: true,
            mensaje: 'Cliente registrado exitosamente',
            data: cliente
        });

    } catch (error) {
        // Manejo específico de error de email duplicado
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }
        console.error('Error en registro de cliente:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el cliente',
            error: error.message
        });
    }
};

const registroProfesional = async (req, res) => {
    try {
        const {
            email, password, nombre, apellido, telefono,
            profesion, especialidades, experiencia, radio_cobertura,
            disponibilidad
        } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Profesional.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }

        // Crear el nuevo profesional
        const profesional = await Profesional.create({
            email,
            password,
            nombre,
            apellido,
            telefono,
            profesion,
            especialidades,
            experiencia,
            calificaciones: [],
            servicios: req.body.servicios || [],
            radio_cobertura,
            disponibilidad: disponibilidad || {
                horarios: [],
                estado: 'disponible'
            },
            documentosVerificados: {
                dni: { verificado: false },
                matricula: { verificado: false },
                antecedentes: { verificado: false }
            }
            // ubicacion se maneja automáticamente con el valor por defecto
        });

        res.status(201).json({
            success: true,
            mensaje: 'Profesional registrado exitosamente',
            data: profesional
        });

    } catch (error) {
        // Manejo específico de error de email duplicado
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({
                success: false,
                mensaje: 'El email ya está registrado'
            });
        }
        console.error('Error en registro de profesional:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el profesional',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario en el modelo base para encontrar cualquier tipo de usuario
        const usuario = await BaseUser.findOne({ email }).select('+password');

        if (!usuario) {
            console.log(`Intento de login fallido: email "${email}" no encontrado.`);
            return res.status(401).json({
                success: false,
                mensaje: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
            console.log(`Intento de login fallido: contraseña incorrecta para email "${email}".`);
            return res.status(401).json({
                success: false,
                mensaje: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario._id,
                tipo: usuario.tipo // El discriminator key se obtiene directamente del usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            mensaje: 'Login exitoso',
            data: {
                token,
                usuario: usuario.toJSON() // Usamos el método toJSON para no enviar el hash del password
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

const logout = async (req, res) => {
    // En un sistema con estado (p. ej. sessions), aquí se limpiaría la sesión.
    // Con JWT, el logout es principalmente del lado del cliente.
    // Opcionalmente, se puede implementar una lista negra de tokens aquí.
    res.json({
        success: true,
        mensaje: 'Logout exitoso'
    });
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar usuario en el modelo base
        const usuario = await BaseUser.findOne({ email });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'No existe una cuenta con ese email'
            });
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora

        // Guardar token en usuario
        usuario.resetPasswordToken = resetToken;
        usuario.resetPasswordExpires = resetTokenExpiry;
        await usuario.save();

        // Configurar email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de Contraseña - Profesiones UY',
            html: `
                <h1>Recuperación de Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Haz click en el siguiente enlace para continuar:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, ignora este email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            mensaje: 'Se ha enviado un email con las instrucciones para recuperar tu contraseña'
        });

    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar la recuperación de contraseña',
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Buscar usuario con token válido en el modelo base
        const usuario = await BaseUser.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({
                success: false,
                mensaje: 'Token inválido o expirado'
            });
        }

        // Actualizar contraseña
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(newPassword, salt);
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpires = undefined;
        await usuario.save();

        res.json({
            success: true,
            mensaje: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al resetear la contraseña',
            error: error.message
        });
    }
};

module.exports = {
    registroCliente,
    registroProfesional,
    login,
    logout,
    forgotPassword,
    resetPassword
}; 