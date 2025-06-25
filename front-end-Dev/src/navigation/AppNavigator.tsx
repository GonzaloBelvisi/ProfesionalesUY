import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

// Pantallas de autenticación
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';
import ForgotPasswordScreen from '../components/ForgotPasswordScreen';

// Pantallas principales
import HomeScreen from '../components/HomeScreen';
import ProfesionalDetailScreen from '../components/ProfesionalDetailScreen';
import AppointmentsScreen from '../components/AppointmentsScreen';
import ProfileScreen from '../components/ProfileScreen';
import NewAppointmentScreen from '../components/NewAppointmentScreen';

// Iconos
import { Ionicons } from '@expo/vector-icons';

// Tipos de navegación
type AuthStackParamList = {
  Login: undefined;
  Register: { tipo: 'cliente' | 'profesional' };
  ForgotPassword: undefined;
};

type MainStackParamList = {
  MainTabs: undefined;
  ProfesionalDetail: { profesional: any };
  NewAppointment: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

// Componente de loading
const LoadingScreen = () => (
  <LinearGradient
    colors={['#667eea', '#764ba2']}
    style={styles.loadingContainer}
  >
    <View style={styles.loadingContent}>
      <Text style={styles.loadingLogo}>👨‍⚕️</Text>
      <Text style={styles.loadingTitle}>ProfesionesUY</Text>
      <ActivityIndicator size="large" color="white" style={styles.spinner} />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  </LinearGradient>
);

// Navegador de autenticación
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Navegador principal con tabs
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Appointments') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#667eea',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Inicio' }}
    />
    <Tab.Screen 
      name="Appointments" 
      component={AppointmentsScreen}
      options={{ title: 'Mis Citas' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Tab.Navigator>
);

// Navegador principal con stack para pantallas adicionales
const MainStackNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
    <MainStack.Screen name="ProfesionalDetail" component={ProfesionalDetailScreen} />
    <MainStack.Screen name="NewAppointment" component={NewAppointmentScreen} />
  </MainStack.Navigator>
);

// Navegador principal de la aplicación
const AppNavigator = () => {
  const { user, loading } = useAuth();

  console.log('🔄 AppNavigator render - loading:', loading, 'user:', user ? 'exists' : 'null');

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default AppNavigator; 