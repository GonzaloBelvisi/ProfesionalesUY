import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { profileService, appointmentService } from '../services/api';
import { Profesional } from '../types';

const NewAppointmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [selectedProfesional, setSelectedProfesional] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchProfesionales = async () => {
      setLoading(true);
      try {
        const res = await profileService.getAllProfessionals();
        if (res.success && res.data) setProfesionales(res.data);
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los profesionales');
      } finally {
        setLoading(false);
      }
    };
    fetchProfesionales();
  }, []);

  useEffect(() => {
    if (selectedProfesional && date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedHour('');
    }
    // eslint-disable-next-line
  }, [selectedProfesional, date]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedHour('');
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await appointmentService.getAvailableSlots(selectedProfesional, dateStr);
      if (res.success && res.data) setAvailableSlots(res.data);
    } catch (e) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleAgendar = async () => {
    if (!selectedProfesional || !selectedHour) {
      Alert.alert('Completa todos los campos');
      return;
    }
    try {
      const cita = {
        profesional: selectedProfesional,
        fecha: date.toISOString().split('T')[0],
        hora: selectedHour,
        comentario: comment,
      };
      const res = await appointmentService.createAppointment(cita);
      if (res.success) {
        Alert.alert('Cita agendada', 'Tu cita fue agendada correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.mensaje || 'No se pudo agendar la cita');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo agendar la cita');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Agendar nueva cita</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" />
        ) : (
          <>
            {/* Selección de profesional */}
            <Text style={styles.label}>Profesional</Text>
            <View style={styles.selectBox}>
              {profesionales.length === 0 ? (
                <Text>No hay profesionales disponibles</Text>
              ) : (
                profesionales.map((prof) => (
                  <TouchableOpacity
                    key={prof._id}
                    style={selectedProfesional === prof._id ? styles.selectedOption : styles.option}
                    onPress={() => setSelectedProfesional(prof._id)}
                  >
                    <Text style={styles.optionText}>{prof.nombre} {prof.apellido} - {prof.profesion}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Selección de fecha */}
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.optionText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
                minimumDate={new Date()}
              />
            )}

            {/* Selección de hora */}
            <Text style={styles.label}>Hora</Text>
            <View style={styles.selectBox}>
              {loadingSlots ? (
                <ActivityIndicator size="small" color="#667eea" />
              ) : availableSlots.length === 0 ? (
                <Text>No hay horarios disponibles</Text>
              ) : (
                availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={selectedHour === slot ? styles.selectedOption : styles.option}
                    onPress={() => setSelectedHour(slot)}
                  >
                    <Text style={styles.optionText}>{slot}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Comentario opcional */}
            <Text style={styles.label}>Comentario (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Motivo de la cita"
              value={comment}
              onChangeText={setComment}
            />

            {/* Botón agendar */}
            <View style={{ marginTop: 24 }}>
              <Button title="Agendar cita" onPress={handleAgendar} color="#4CAF50" />
            </View>
          </>
        )}
        <View style={{ marginTop: 16 }}>
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  selectBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  option: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#667eea',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    marginBottom: 8,
  },
});

export default NewAppointmentScreen; 