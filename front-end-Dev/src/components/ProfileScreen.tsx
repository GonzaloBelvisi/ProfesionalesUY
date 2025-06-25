import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/api';
import { Cliente, Profesional } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para edición
  const [editData, setEditData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    if (!editData.nombre || !editData.apellido || !editData.email) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'cliente') {
        response = await profileService.updateClientProfile(user._id, editData);
      } else {
        response = await profileService.updateProfessionalProfile(user?._id || '', editData);
      }

      if (response.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setShowEditModal(false);
        // Aquí podrías actualizar el contexto del usuario
      } else {
        Alert.alert('Error', response.message || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>Nombre</Text>
        <Text style={styles.profileValue}>{user?.nombre}</Text>
      </View>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>Apellido</Text>
        <Text style={styles.profileValue}>{user?.apellido}</Text>
      </View>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>Email</Text>
        <Text style={styles.profileValue}>{user?.email}</Text>
      </View>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>Teléfono</Text>
        <Text style={styles.profileValue}>{user?.telefono || 'No especificado'}</Text>
      </View>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>Tipo de Usuario</Text>
        <Text style={styles.profileValue}>
          {user?.role === 'cliente' ? 'Cliente' : 'Profesional'}
        </Text>
      </View>
    </View>
  );

  const renderClienteSection = () => {
    if (user?.role !== 'cliente') return null;
    const cliente = user as Cliente;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Cliente</Text>
        
        {cliente.direccion && (
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Dirección</Text>
            <Text style={styles.profileValue}>
              {cliente.direccion.calle} {cliente.direccion.numero}, {cliente.direccion.ciudad}
            </Text>
          </View>
        )}
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Citas Realizadas</Text>
          <Text style={styles.profileValue}>{cliente.historialCitas.length}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Servicios Contratados</Text>
          <Text style={styles.profileValue}>{cliente.historialServicios.length}</Text>
        </View>
      </View>
    );
  };

  const renderProfesionalSection = () => {
    if (user?.role !== 'profesional') return null;
    const profesional = user as Profesional;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Profesional</Text>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Profesión</Text>
          <Text style={styles.profileValue}>{profesional.profesion}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Experiencia</Text>
          <Text style={styles.profileValue}>{profesional.experiencia} años</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Calificación Promedio</Text>
          <Text style={styles.profileValue}>⭐ {profesional.promedioCalificacion.toFixed(1)}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Especialidades</Text>
          <Text style={styles.profileValue}>
            {profesional.especialidades.join(', ')}
          </Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Radio de Cobertura</Text>
          <Text style={styles.profileValue}>{profesional.radio_cobertura} km</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Estado</Text>
          <Text style={styles.profileValue}>
            {profesional.disponibilidad.estado === 'disponible' ? '🟢 Disponible' : 
             profesional.disponibilidad.estado === 'ocupado' ? '🟡 Ocupado' : '🔴 No disponible'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerSubtitle}>
            Gestiona tu información personal
          </Text>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Avatar y nombre */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {user?.nombre.charAt(0)}{user?.apellido.charAt(0)}
              </Text>
            </View>
            <Text style={styles.userName}>
              {user?.nombre} {user?.apellido}
            </Text>
            <Text style={styles.userRole}>
              {user?.role === 'cliente' ? 'Cliente' : 'Profesional'}
            </Text>
          </View>

          {/* Secciones de información */}
          {renderProfileSection()}
          {renderClienteSection()}
          {renderProfesionalSection()}

          {/* Acciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowEditModal(true)}
            >
              <Text style={styles.actionButtonText}>✏️ Editar Perfil</Text>
            </TouchableOpacity>
            
            {user?.role === 'profesional' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ScheduleSettings')}
              >
                <Text style={styles.actionButtonText}>📅 Configurar Horarios</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.actionButtonText}>⚙️ Configuración</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={logout}
            >
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
                🚪 Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de edición */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditModal(false)}
        >
          <LinearGradient
            colors={['#fdfcfb', '#e2d1c3']}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={editData.nombre}
                onChangeText={(text) => setEditData({ ...editData, nombre: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={editData.apellido}
                onChangeText={(text) => setEditData({ ...editData, apellido: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={editData.telefono}
                onChangeText={(text) => setEditData({ ...editData, telefono: text })}
                keyboardType="phone-pad"
              />
               <TextInput
                style={styles.input}
                placeholder="Email"
                value={editData.email}
                editable={false} // El email no se puede editar
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={logout}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  logoutButtonText: {
    color: '#e53e3e',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen; 