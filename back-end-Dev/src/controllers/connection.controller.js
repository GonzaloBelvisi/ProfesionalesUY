const Connection = require('../models/connection.model');
const Cliente = require('../models/cliente.model');
const Profesional = require('../models/profesional.model');

// Crear una nueva conexión (cliente conecta con profesional)
const createConnection = async (req, res) => {
    try {
        const { clienteId, profesionalId } = req.body;

        // Validar que ambos IDs existan
        const cliente = await Cliente.findById(clienteId);
        const profesional = await Profesional.findById(profesionalId);

        if (!cliente || !profesional) {
            return res.status(404).json({
                success: false,
                mensaje: 'Cliente o Profesional no encontrado'
            });
        }

        // Buscar si ya existe una conexión, sin importar su estado
        let connection = await Connection.findOne({
            cliente: clienteId,
            profesional: profesionalId
        });

        // Si la conexión existe pero está inactiva, la reactivamos
        if (connection && connection.estado === 'inactiva') {
            connection.estado = 'activa';
            connection.fechaConexion = new Date(); // Opcional: actualizar la fecha
            await connection.save();
            
            return res.status(200).json({
                success: true,
                mensaje: 'Conexión reactivada exitosamente',
                data: connection
            });
        }
        
        // Si la conexión ya está activa, no hacemos nada
        if (connection && connection.estado === 'activa') {
            return res.status(400).json({
                success: false,
                mensaje: 'Ya estás conectado con este profesional'
            });
        }

        // Si no existe, creamos una nueva conexión
        const newConnection = new Connection({
            cliente: clienteId,
            profesional: profesionalId
        });
        await newConnection.save();

        res.status(201).json({
            success: true,
            mensaje: 'Conexión creada exitosamente',
            data: newConnection
        });

    } catch (error) {
        console.error('Error al crear/actualizar conexión:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar la conexión',
            error: error.message
        });
    }
};

// Obtener todas las conexiones de un cliente
const getClientConnections = async (req, res) => {
    try {
        const { clienteId } = req.params;

        const connections = await Connection.find({
            cliente: clienteId,
            estado: 'activa'
        })
        .populate('profesional', 'nombre apellido profesion promedioCalificacion avatar')
        .sort({ fechaConexion: -1 });

        res.json({
            success: true,
            data: connections,
            total: connections.length
        });

    } catch (error) {
        console.error('Error al obtener conexiones:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener las conexiones',
            error: error.message
        });
    }
};

// Eliminar una conexión (desconectar)
const deleteConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;

        const connection = await Connection.findByIdAndUpdate(
            connectionId,
            { estado: 'inactiva' },
            { new: true }
        );

        if (!connection) {
            return res.status(404).json({
                success: false,
                mensaje: 'Conexión no encontrada'
            });
        }

        res.json({
            success: true,
            mensaje: 'Conexión eliminada exitosamente',
            data: connection
        });

    } catch (error) {
        console.error('Error al eliminar conexión:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar la conexión',
            error: error.message
        });
    }
};

// Verificar si existe una conexión entre cliente y profesional
const checkConnection = async (req, res) => {
    try {
        const { clienteId, profesionalId } = req.query;

        const connection = await Connection.findOne({
            cliente: clienteId,
            profesional: profesionalId,
            estado: 'activa'
        });

        res.json({
            success: true,
            isConnected: !!connection,
            data: connection
        });

    } catch (error) {
        console.error('Error al verificar conexión:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al verificar la conexión',
            error: error.message
        });
    }
};

module.exports = {
    createConnection,
    getClientConnections,
    deleteConnection,
    checkConnection
}; 