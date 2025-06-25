import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Cliente, Profesional } from '../types';
import { authService } from '../services/api';

interface RegisterScreenProps {
  navigation: any;
  route: {
    params: {
      tipo: 'cliente' | 'profesional';
    };
  };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const { tipo } = route.params;
  const { register, loading, login } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Campos comunes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Campos específicos de cliente
  const [direccion, setDireccion] = useState({
    calle: '',
    numero: '',
    ciudad: '',
    codigoPostal: '',
  });

  // Campos específicos de profesional
  const [profesion, setProfesion] = useState('');
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [experiencia, setExperiencia] = useState('');
  const [radioCobertura, setRadioCobertura] = useState('5');
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  const handleRegister = async () => {
    // Validaciones básicas
    if (!email || !password || !confirmPassword || !nombre || !apellido) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    } else {
      setPasswordError(null);
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validaciones específicas por tipo
    if (tipo === 'profesional') {
      if (!profesion || especialidades.length === 0 || !experiencia) {
        Alert.alert('Error', 'Por favor completa todos los campos del profesional');
        return;
      }
    }

    if (emailError) {
      Alert.alert('Error', emailError);
      return;
    }

    // Validar email antes de registrar
    const exists = await authService.checkEmailExists(email, tipo);
    if (exists) {
      setEmailError('El email ya está registrado');
      Alert.alert('Error', 'El email ya está registrado');
      return;
    }

    try {
      console.log('📝 Iniciando registro como:', tipo);
      setLocalLoading(true);
      
      const userData: Partial<Cliente | Profesional> = {
        email,
        password,
        nombre,
        apellido,
        telefono: telefono || undefined,
      };

      if (tipo === 'cliente') {
        (userData as Partial<Cliente>).direccion = direccion;
      } else {
        (userData as Partial<Profesional>).profesion = profesion;
        (userData as Partial<Profesional>).especialidades = especialidades;
        (userData as Partial<Profesional>).experiencia = parseInt(experiencia);
        (userData as Partial<Profesional>).radio_cobertura = parseInt(radioCobertura);
      }

      console.log('📤 Enviando datos de registro:', userData);
      const response = await register(userData, tipo);
      
      console.log('📥 Respuesta del registro:', response);
      
      if (response.success) {
        sessionStorage.setItem('registerMessage', '¡Su cuenta se creó correctamente!');
        navigation.navigate('Login');
        return;
      } else {
        if (response.message && response.message.includes('registrado')) {
          setEmailError('El email ya está registrado');
        }
        // Redirigir al login con mensaje de error
        navigation.navigate('Login', { registerMessage: response.message || 'Ocurrió un error durante el registro.' });
        return;
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      // Redirigir al login con mensaje de error
      navigation.navigate('Login', { registerMessage: error.message || 'No se pudo completar el registro.' });
      return;
    } finally {
      setLocalLoading(false);
    }
  };

  const addEspecialidad = () => {
    if (nuevaEspecialidad.trim() && !especialidades.includes(nuevaEspecialidad.trim())) {
      setEspecialidades([...especialidades, nuevaEspecialidad.trim()]);
      setNuevaEspecialidad('');
    }
  };

  const removeEspecialidad = (index: number) => {
    setEspecialidades(especialidades.filter((_, i) => i !== index));
  };

  // Validar si el email ya está registrado
  const checkEmailExists = async () => {
    if (!email) return;
    const exists = await authService.checkEmailExists(email, tipo);
    if (exists) {
      setEmailError('El email ya está registrado');
    } else {
      setEmailError(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.title}>
                Registro como {tipo === 'cliente' ? 'Cliente' : 'Profesional'}
              </Text>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              {/* Campos comunes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    value={nombre}
                    onChangeText={setNombre}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu apellido"
                    value={apellido}
                    onChangeText={setApellido}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    value={email}
                    onChangeText={text => { setEmail(text); setEmailError(null); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={checkEmailExists}
                  />
                  {emailError && <Text style={{ color: 'red', marginTop: 4 }}>{emailError}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Tu contraseña"
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        if (passwordError) setPasswordError(null);
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar Contraseña *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Confirma tu contraseña"
                      value={confirmPassword}
                      onChangeText={text => {
                        setConfirmPassword(text);
                        if (passwordError) setPasswordError(null);
                      }}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIcon}>
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError && <Text style={{ color: 'red', marginTop: 4 }}>{passwordError}</Text>}
                </View>
              </View>

              {/* Campos específicos por tipo */}
              {tipo === 'cliente' ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dirección</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Calle</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la calle"
                      value={direccion.calle}
                      onChangeText={(text) => setDireccion({...direccion, calle: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Número</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de puerta"
                      value={direccion.numero}
                      onChangeText={(text) => setDireccion({...direccion, numero: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ciudad</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ciudad"
                      value={direccion.ciudad}
                      onChangeText={(text) => setDireccion({...direccion, ciudad: text})}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Código Postal</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Código postal"
                      value={direccion.codigoPostal}
                      onChangeText={(text) => setDireccion({...direccion, codigoPostal: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Información Profesional</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Profesión *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Médico, Abogado, Ingeniero"
                      value={profesion}
                      onChangeText={setProfesion}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Años de Experiencia *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de años"
                      value={experiencia}
                      onChangeText={setExperiencia}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Radio de Cobertura (km)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5"
                      value={radioCobertura}
                      onChangeText={setRadioCobertura}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Especialidades *</Text>
                    <View style={styles.especialidadesContainer}>
                      <TextInput
                        style={[styles.input, styles.especialidadInput]}
                        placeholder="Agregar especialidad"
                        value={nuevaEspecialidad}
                        onChangeText={setNuevaEspecialidad}
                      />
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={addEspecialidad}
                      >
                        <Text style={styles.addButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {especialidades.map((esp, index) => (
                      <View key={index} style={styles.especialidadTag}>
                        <Text style={styles.especialidadText}>{esp}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeEspecialidad(index)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.registerButton, localLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={localLoading}
              >
                <Text style={styles.registerButtonText}>
                  {localLoading ? 'Registrando...' : 'Registrarse'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showSuccessModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.modalTitle}>¡Registro Exitoso!</Text>
              <Text style={styles.modalSubtitle}>
                Tu cuenta ha sido creada. Ahora puedes iniciar sesión.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.modalButtonText}>Ir a Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 20,
  },
  especialidadesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  especialidadInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  especialidadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  especialidadText: {
    color: '#333',
    fontSize: 14,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 