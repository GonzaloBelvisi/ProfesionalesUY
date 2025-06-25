# ProfesionesUY - Frontend

Aplicación móvil para conectar clientes con profesionales en Uruguay, desarrollada con Expo y React Native.

## 🚀 Características

- **Autenticación completa**: Registro y login para clientes y profesionales
- **Búsqueda de profesionales**: Filtros por profesión, especialidad y ubicación
- **Sistema de citas**: Agendar, gestionar y cancelar citas
- **Perfiles detallados**: Información completa de profesionales con calificaciones
- **Gestión de horarios**: Configuración de disponibilidad para profesionales
- **Interfaz moderna**: Diseño atractivo con gradientes y animaciones

## 📱 Pantallas Principales

### Autenticación
- **Login**: Inicio de sesión con email y contraseña
- **Registro**: Formularios específicos para clientes y profesionales

### Cliente
- **Home**: Búsqueda y listado de profesionales
- **Detalle Profesional**: Información completa y agendar citas
- **Mis Citas**: Gestión de citas programadas
- **Perfil**: Información personal y configuración

### Profesional
- **Home**: Dashboard con citas pendientes
- **Gestión de Citas**: Confirmar, cancelar y completar citas
- **Configuración de Horarios**: Establecer disponibilidad
- **Perfil**: Información profesional y servicios

## 🛠️ Tecnologías Utilizadas

- **Expo**: Framework para desarrollo móvil
- **React Native**: Framework de UI nativo
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación entre pantallas
- **Axios**: Cliente HTTP para API
- **AsyncStorage**: Almacenamiento local
- **Expo Linear Gradient**: Gradientes visuales

## 📦 Instalación

### Prerrequisitos

- Node.js v22.16.0 o superior
- npm v10.9.2 o superior
- Expo CLI instalado globalmente

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd front-end-Dev
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crear archivo `.env` en la raíz del proyecto
   - Configurar la URL del backend:
     ```
     API_BASE_URL=http://localhost:5000
     ```

4. **Ejecutar la aplicación**
   ```bash
   # Para desarrollo web
   npm run web
   
   # Para Android
   npm run android
   
   # Para iOS (solo macOS)
   npm run ios
   ```

## 🔧 Configuración del Backend

Asegúrate de que el backend esté ejecutándose en `http://localhost:5000` o actualiza la URL en `src/services/api.ts`.

### Endpoints principales utilizados:

- `POST /login` - Autenticación
- `POST /auth/registro/cliente` - Registro de clientes
- `POST /auth/registro/profesional` - Registro de profesionales
- `GET /profile/profesionales` - Listar profesionales
- `POST /appointments` - Crear citas
- `GET /appointments/client/:id` - Citas del cliente

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes de pantallas
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── ProfesionalDetailScreen.tsx
│   ├── AppointmentsScreen.tsx
│   └── ProfileScreen.tsx
├── contexts/            # Contextos de React
│   └── AuthContext.tsx
├── navigation/          # Configuración de navegación
│   └── AppNavigator.tsx
├── services/           # Servicios de API
│   └── api.ts
└── types/              # Definiciones de TypeScript
    └── index.ts
```

## 🎨 Diseño y UX

### Paleta de colores
- **Primario**: `#667eea` (Azul)
- **Secundario**: `#764ba2` (Púrpura)
- **Éxito**: `#4CAF50` (Verde)
- **Error**: `#F44336` (Rojo)
- **Advertencia**: `#FFA500` (Naranja)

### Características de diseño
- Gradientes modernos
- Bordes redondeados
- Sombras sutiles
- Iconos intuitivos
- Tipografía clara y legible

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para la autenticación:

1. **Login**: El usuario ingresa email y contraseña
2. **Token**: Se recibe un JWT del servidor
3. **Almacenamiento**: El token se guarda en AsyncStorage
4. **Interceptores**: Axios automáticamente incluye el token en las peticiones
5. **Expiración**: Si el token expira, se redirige al login

## 📱 Funcionalidades por Rol

### Cliente
- Buscar profesionales por profesión
- Ver perfiles detallados con calificaciones
- Agendar citas con fecha y hora
- Gestionar citas (cancelar, ver detalles)
- Editar perfil personal

### Profesional
- Configurar horarios de disponibilidad
- Gestionar citas (confirmar, completar, cancelar)
- Ver calificaciones y comentarios
- Editar información profesional
- Configurar servicios y precios

## 🚀 Despliegue

### Para producción

1. **Construir la aplicación**
   ```bash
   expo build:android  # Para Android
   expo build:ios      # Para iOS
   ```

2. **Publicar en Expo**
   ```bash
   expo publish
   ```

3. **Configurar variables de producción**
   - Actualizar `API_BASE_URL` en `src/services/api.ts`
   - Configurar certificados para iOS/Android

## 🐛 Solución de Problemas

### Errores comunes

1. **Error de conexión al backend**
   - Verificar que el backend esté ejecutándose
   - Comprobar la URL en `src/services/api.ts`

2. **Error de dependencias**
   ```bash
   npm install --force
   expo install --fix
   ```

3. **Error de Metro bundler**
   ```bash
   expo start --clear
   ```

## 📞 Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 