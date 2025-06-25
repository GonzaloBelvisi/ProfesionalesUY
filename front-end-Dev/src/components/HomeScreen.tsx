import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/api';
import { Profesional } from '../types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfesionales, setFilteredProfesionales] = useState<Profesional[]>([]);

  // Profesiones populares para mostrar como sugerencias
  const profesionesPopulares = [
    'Médico', 'Abogado', 'Ingeniero', 'Contador', 'Psicólogo',
    'Dentista', 'Arquitecto', 'Veterinario', 'Farmacéutico', 'Enfermero'
  ];

  useEffect(() => {
    loadProfesionales();
  }, []);

  useEffect(() => {
    filterProfesionales();
  }, [searchQuery, profesionales]);

  const loadProfesionales = async () => {
    try {
      setLoading(true);
      const response = await profileService.getAllProfessionals();
      if (response.success && response.data) {
        setProfesionales(response.data);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
      Alert.alert('Error', 'No se pudieron cargar los profesionales');
    } finally {
      setLoading(false);
    }
  };

  const filterProfesionales = () => {
    if (!searchQuery.trim()) {
      setFilteredProfesionales(profesionales);
      return;
    }

    const filtered = profesionales.filter(profesional =>
      profesional.profesion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profesional.especialidades.some(esp => 
        esp.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      `${profesional.nombre} ${profesional.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProfesionales(filtered);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const renderProfesionalCard = ({ item }: { item: Profesional }) => (
    <TouchableOpacity
      style={styles.profesionalCard}
      onPress={() => navigation.navigate('ProfesionalDetail', { profesional: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {item.nombre.charAt(0)}{item.apellido.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.profesionalName}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.profesion}>{item.profesion}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.promedioCalificacion.toFixed(1)}</Text>
            <Text style={styles.experience}>{item.experiencia} años exp.</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.especialidadesContainer}>
        {item.especialidades.slice(0, 3).map((esp, index) => (
          <View key={index} style={styles.especialidadTag}>
            <Text style={styles.especialidadText}>{esp}</Text>
          </View>
        ))}
        {item.especialidades.length > 3 && (
          <Text style={styles.moreEspecialidades}>+{item.especialidades.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProfesionSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionChip}
      onPress={() => setSearchQuery(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>¡Hola!</Text>
              <Text style={styles.userName}>
                {user?.nombre} {user?.apellido}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Encuentra profesionales cerca de ti
          </Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar profesionales..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Sugerencias de profesiones */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Profesiones populares:</Text>
          <FlatList
            data={profesionesPopulares}
            renderItem={renderProfesionSuggestion}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>

        {/* Lista de profesionales */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Resultados de búsqueda' : 'Profesionales destacados'}
            </Text>
            <Text style={styles.resultsCount}>
              {filteredProfesionales.length} profesionales
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando profesionales...</Text>
            </View>
          ) : filteredProfesionales.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No se encontraron profesionales con esa búsqueda'
                  : 'No hay profesionales disponibles'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProfesionales}
              renderItem={renderProfesionalCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.profesionalesList}
            />
          )}
        </View>

        {/* Botón flotante para nueva cita */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('NewAppointment')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  suggestionsList: {
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  suggestionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profesionalesList: {
    paddingBottom: 100,
  },
  profesionalCard: {
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
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardInfo: {
    flex: 1,
  },
  profesionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profesion: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  especialidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  especialidadTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  especialidadText: {
    fontSize: 12,
    color: '#666',
  },
  moreEspecialidades: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
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
    marginTop: -20,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -5,
  },
});

export default HomeScreen; 