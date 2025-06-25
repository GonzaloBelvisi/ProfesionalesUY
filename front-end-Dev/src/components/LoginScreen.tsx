import React, { useState, useEffect } from 'react';
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
  Modal,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/logo.png';

interface LoginScreenProps {
  navigation: any;
  route: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const { login, loading, loginError, setLoginError, clearLoginError } = useAuth();
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [successOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    // Siempre leer el mensaje de éxito desde sessionStorage al montar
    const msg = sessionStorage.getItem('registerMessage');
    if (msg) {
      setRegisterMessage(msg);
      sessionStorage.removeItem('registerMessage');
      clearLoginError();
      // Iniciar animación de fade out después de 3.5s
      successOpacity.setValue(1);
      setTimeout(() => {
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => setRegisterMessage(null));
      }, 3500);
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log('🔄 LoginScreen UNMOUNT');
    };
  }, []);

  // Limpiar error solo al cambiar email o contraseña
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (loginError) clearLoginError();
    if (registerMessage) setRegisterMessage(null);
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (loginError) clearLoginError();
    if (registerMessage) setRegisterMessage(null);
  };

  const handleLogin = async () => {
    setRegisterMessage(null);
    sessionStorage.removeItem('registerMessage');
    if (!email || !password) {
      setLoginError('Por favor completa todos los campos');
      return;
    }
    // No limpiar loginError aquí
    try {
      await login(email, password);
    } catch (error: any) {
      // Extraer mensaje real del backend
      let msg = error?.response?.data?.mensaje || error?.message || 'Error al iniciar sesión';
      if (
        msg.includes('Credenciales inválidas') ||
        msg.includes('no encontrado') ||
        msg.toLowerCase().includes('contraseña')
      ) {
        msg = 'Email o contraseña incorrectos';
      }
      console.log('🟥 setLoginError en catch:', msg);
      setLoginError(msg);
    }
  };

  // Debug: loguear el error de login en cada render
  console.log('🟦 loginError en render:', loginError);
  console.log('🟢 registerMessage en render:', registerMessage);

  // Estilo para el mensaje de error de login
  const loginErrorStyle = {
    color: '#fff',
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontWeight: 'bold' as const,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    textAlign: 'center' as const,
  };

  // Estilo para el mensaje de éxito de registro
  const registerSuccessStyle = {
    color: '#fff',
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontWeight: 'bold' as const,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    textAlign: 'center' as const,
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
            {/* Logo y título */}
            <View style={styles.header}>
              <Image source={logo} style={styles.logoImage} />
              <Text style={styles.title}>ProfesionesUY</Text>
              <Text style={styles.subtitle}>Encuentra profesionales en Uruguay</Text>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Tu contraseña"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
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

              {registerMessage && (
                <Animated.View style={{ marginTop: 18, marginBottom: 10, alignItems: 'center', opacity: successOpacity }}>
                  <Text style={registerSuccessStyle}>{registerMessage}</Text>
                </Animated.View>
              )}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              {/* Mostrar mensaje de error de login siempre debajo del botón */}
              {loginError && (
                <View style={{ marginTop: 18, marginBottom: 10, alignItems: 'center' }}>
                  <Text style={loginErrorStyle}>{loginError}</Text>
                </View>
              )}

              <View style={styles.footerLinks}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.linkText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setRegisterModalVisible(true);
                    clearLoginError();
                    setRegisterMessage(null);
                  }}
                >
                  <Text style={styles.linkText}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={registerModalVisible}
          onRequestClose={() => {
            setRegisterModalVisible(!registerModalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Crear una cuenta</Text>
              <Text style={styles.modalSubtitle}>¿Cómo deseas registrarte?</Text>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setRegisterModalVisible(false);
                  navigation.navigate('Register', { tipo: 'cliente' });
                }}
              >
                <Text style={styles.modalButtonText}>Soy Cliente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setRegisterModalVisible(false);
                  navigation.navigate('Register', { tipo: 'profesional' });
                }}
              >
                <Text style={styles.modalButtonText}>Soy Profesional</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRegisterModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancelar</Text>
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
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
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
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  cancelButtonText: {
    color: '#333',
  },
});

export default LoginScreen; 