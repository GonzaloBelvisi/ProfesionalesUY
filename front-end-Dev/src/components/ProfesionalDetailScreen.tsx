import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { profileService, appointmentService } from '../services/api';
import { Profesional, Calificacion } from '../types';

interface ProfesionalDetailScreenProps {
  navigation: any;
  route: {
    params: {
      profesional: Profesional;
    };
  };
}

const ProfesionalDetailScreen: React.FC<ProfesionalDetailScreenProps> = ({ navigation, route }) => {
  const { profesional } = route.params;
  const { user } = useAuth();
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCalificaciones();
  }, []);

  const loadCalificaciones = async () => {
    try {
      const response = await profileService.getProfessionalRatings(profesional._id);
      if (response.success && response.data) {
        setCalificaciones(response.data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadAvailableSlots = async (date: string) => {
    try {
      const response = await appointmentService.getAvailableSlots(profesional._id, date);
      if (response.success && response.data) {
        setAvailableSlots(response.data);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    loadAvailableSlots(date);
  };

  const handleCreateAppointment = async () => {
    if (!appointmentReason.trim() || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        client: user?._id,
        professional: profesional._id,
        date: new Date(selectedDate),
        time: selectedTime,
        reason: appointmentReason,
      };

      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.success) {
        Alert.alert(
          'Éxito',
          'Cita agendada correctamente',
          [{ text: 'OK', onPress: () => {
            setShowAppointmentModal(false);
            navigation.navigate('Appointments');
          }}]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al agendar la cita');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const renderCalificacion = ({ item }: { item: Calificacion }) => (
    <View style={styles.calificacionItem}>
      <View style={styles.calificacionHeader}>
        <Text style={styles.calificacionPuntuacion}>⭐ {item.puntuacion}</Text>
        <Text style={styles.calificacionFecha}>
          {new Date(item.fecha).toLocaleDateString()}
        </Text>
      </View>
      {item.comentario && (
        <Text style={styles.calificacionComentario}>{item.comentario}</Text>
      )}
    </View>
  );

  const renderTimeSlot = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selectedTime === item && styles.timeSlotSelected
      ]}
      onPress={() => setSelectedTime(item)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedTime === item && styles.timeSlotTextSelected
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Información del profesional */}
          <View style={styles.profesionalInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {profesional.nombre.charAt(0)}{profesional.apellido.charAt(0)}
              </Text>
            </View>
            
            <Text style={styles.profesionalName}>
              {profesional.nombre} {profesional.apellido}
            </Text>
            
            <Text style={styles.profesion}>{profesional.profesion}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>⭐ {profesional.promedioCalificacion.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Calificación</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profesional.experiencia}</Text>
                <Text style={styles.statLabel}>Años exp.</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{calificaciones.length}</Text>
                <Text style={styles.statLabel}>Reseñas</Text>
              </View>
            </View>
          </View>

          {/* Contenido principal */}
          <View style={styles.content}>
            {/* Especialidades */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Especialidades</Text>
              <View style={styles.especialidadesContainer}>
                {profesional.especialidades.map((esp, index) => (
                  <View key={index} style={styles.especialidadTag}>
                    <Text style={styles.especialidadText}>{esp}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Servicios */}
            {profesional.servicios.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicios</Text>
                {profesional.servicios.map((servicio, index) => (
                  <View key={index} style={styles.servicioItem}>
                    <View style={styles.servicioHeader}>
                      <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                      <Text style={styles.servicioPrecio}>${servicio.precio}</Text>
                    </View>
                    <Text style={styles.servicioDescripcion}>{servicio.descripcion}</Text>
                    <Text style={styles.servicioDuracion}>
                      Duración: {servicio.duracionEstimada} min
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disponibilidad */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Disponibilidad</Text>
              <Text style={styles.disponibilidadEstado}>
                Estado: {profesional.disponibilidad.estado}
              </Text>
              {profesional.disponibilidad.horarios.map((horario, index) => (
                <Text key={index} style={styles.horario}>
                  {horario.dia}: {horario.horaInicio} - {horario.horaFin}
                </Text>
              ))}
            </View>

            {/* Calificaciones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reseñas ({calificaciones.length})</Text>
              {calificaciones.length > 0 ? (
                <FlatList
                  data={calificaciones}
                  renderItem={renderCalificacion}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noCalificaciones}>No hay reseñas aún</Text>
              )}
            </View>
          </View>
        </View>

        {/* Botón de agendar cita */}
        <TouchableOpacity
          style={styles.appointmentButton}
          onPress={() => setShowAppointmentModal(true)}
        >
          <Text style={styles.appointmentButtonText}>Agendar Cita</Text>
        </TouchableOpacity>

        {/* Modal de agendar cita */}
        <Modal
          visible={showAppointmentModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Cita</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAppointmentModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Motivo de la consulta *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe el motivo de tu consulta..."
                  value={appointmentReason}
                  onChangeText={setAppointmentReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={handleDateChange}
                />
              </View>

              {selectedDate && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Horario disponible *</Text>
                  <FlatList
                    data={availableSlots}
                    renderItem={renderTimeSlot}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeSlotsContainer}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleCreateAppointment}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Agendando...' : 'Confirmar Cita'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profesionalInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  profesionalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  profesion: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  especialidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  especialidadTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  especialidadText: {
    fontSize: 14,
    color: '#666',
  },
  servicioItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  servicioPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  servicioDuracion: {
    fontSize: 12,
    color: '#999',
  },
  disponibilidadEstado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  horario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calificacionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  calificacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calificacionPuntuacion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  calificacionFecha: {
    fontSize: 12,
    color: '#999',
  },
  calificacionComentario: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noCalificaciones: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  appointmentButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appointmentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  timeSlotsContainer: {
    paddingRight: 20,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeSlotSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfesionalDetailScreen; 