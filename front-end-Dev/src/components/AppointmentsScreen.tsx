import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/api';
import { Cita } from '../types';

interface AppointmentsScreenProps {
  navigation: any;
}

const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointmentsByClient(user?._id || '');
      if (response.success && response.data) {
        setCitas(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitas();
    setRefreshing(false);
  };

  const handleCancelAppointment = async (citaId: string) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que quieres cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await appointmentService.updateAppointment(citaId, {
                status: 'cancelled'
              });
              if (response.success) {
                Alert.alert('Éxito', 'Cita cancelada correctamente');
                loadCitas();
              } else {
                Alert.alert('Error', response.message || 'Error al cancelar la cita');
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Error al cancelar la cita');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const renderCita = ({ item }: { item: Cita }) => (
    <View style={styles.citaCard}>
      <View style={styles.citaHeader}>
        <View style={styles.citaInfo}>
          <Text style={styles.citaDate}>{formatDate(item.date)}</Text>
          <Text style={styles.citaTime}>{formatTime(item.time)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.citaDetails}>
        <Text style={styles.citaReason}>{item.reason}</Text>
        {item.notes && (
          <Text style={styles.citaNotes}>Notas: {item.notes}</Text>
        )}
      </View>

      <View style={styles.citaActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProfesionalDetail', { 
                profesional: { _id: item.professional } 
              })}
            >
              <Text style={styles.actionButtonText}>Ver Profesional</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelAppointment(item._id)}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfesionalDetail', { 
              profesional: { _id: item.professional } 
            })}
          >
            <Text style={styles.actionButtonText}>Ver Detalles</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No tienes citas</Text>
      <Text style={styles.emptyText}>
        Agenda tu primera cita con un profesional
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>Buscar Profesionales</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Citas</Text>
          <Text style={styles.headerSubtitle}>
            Gestiona tus citas programadas
          </Text>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando citas...</Text>
            </View>
          ) : (
            <FlatList
              data={citas}
              renderItem={renderCita}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.citasList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#667eea']}
                  tintColor="#667eea"
                />
              }
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </View>

        {/* Botón flotante para nueva cita */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  citasList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  citaCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  citaInfo: {
    flex: 1,
  },
  citaDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  citaTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  citaDetails: {
    marginBottom: 16,
  },
  citaReason: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  citaNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  citaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F44336',
    marginRight: 0,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -5,

  },
});

export default AppointmentsScreen; 