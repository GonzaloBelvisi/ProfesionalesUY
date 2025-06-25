# Profesiones UY - Backend

API REST para la aplicación de servicios profesionales.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB instalado y corriendo localmente
- npm o yarn

### Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd profesiones-uy-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env en la raíz del proyecto:
```env
MONGODB_URI=mongodb://localhost:27017/profesiones_uy
PORT=4000
JWT_SECRET=tu_secreto_jwt
```

4. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

### 🔄 Actualización del Proyecto

Cuando otro miembro del equipo haya agregado nuevas dependencias:

1. Actualizar el código:
```bash
git pull origin main
```

2. Instalar nuevas dependencias:
```bash
npm install
```

## 📚 Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm test`: Ejecuta los tests
- `npm run lint`: Ejecuta el linter
- `npm run seed`: Ejecuta el seeder de la base de datos

## 🛠️ Tecnologías Principales

- Express.js - Framework web
- Mongoose - ODM para MongoDB
- JWT - Autenticación
- bcryptjs - Encriptación
- express-validator - Validación de datos
- morgan - Logging

## 📁 Estructura del Proyecto

```
src/
├── config/         # Configuraciones
├── controllers/    # Controladores
├── middleware/     # Middleware personalizado
├── models/         # Modelos de Mongoose
├── routes/         # Rutas de la API
├── services/       # Servicios
├── utils/          # Utilidades
└── server.js       # Punto de entrada
```

## 🔐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Requeridas
MONGODB_URI=mongodb://localhost:27017/profesiones_uy
PORT=4000
JWT_SECRET=tu_secreto_jwt

# Opcionales
NODE_ENV=development
LOG_LEVEL=debug
```

## 👥 Equipo

- [Nombre 1] - Rol/Responsabilidad
- [Nombre 2] - Rol/Responsabilidad

## 📝 Licencia

ISC