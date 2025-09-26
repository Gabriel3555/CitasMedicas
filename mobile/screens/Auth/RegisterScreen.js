import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import * as Animatable from 'react-native-animatable';
import { register } from '../../apis/authApi';
import { getEps } from '../../apis/epsApi';
import { getEspecialidades } from '../../apis/especialidadesApi';

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [telefono, setTelefono] = useState("");
  const [epsId, setEpsId] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [epsList, setEpsList] = useState([]);
  const [especialidadesList, setEspecialidadesList] = useState([]);

  const [nombreError, setNombreError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    loadEpsAndEspecialidades();
  }, []);

  const loadEpsAndEspecialidades = async () => {
    try {
      const epsResult = await getEps();
      if (epsResult.success) {
        setEpsList(epsResult.data);
      }

      const especialidadesResult = await getEspecialidades();
      if (especialidadesResult.success) {
        setEspecialidadesList(especialidadesResult.data);
      }
    } catch (error) {
      console.error('Error loading EPS and especialidades:', error);
    }
  };

  const validateNombre = (nombre) => {
    if (!nombre) {
      setNombreError("El nombre es requerido");
      return false;
    } else if (nombre.length < 2) {
      setNombreError("El nombre debe tener al menos 2 caracteres");
      return false;
    } else {
      setNombreError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("El email es requerido");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Ingresa un email válido");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("La contraseña es requerida");
      return false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError("La confirmación de contraseña es requerida");
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const validateRole = (role) => {
    if (!role) {
      setRoleError("Debes seleccionar un tipo de cuenta");
      return false;
    } else {
      setRoleError("");
      return true;
    }
  };

  const handleRegister = async () => {
    const isNombreValid = validateNombre(nombre);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(password_confirmation);
    const isRoleValid = validateRole(role);

    if (!isNombreValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isRoleValid) {
      return;
    }

    setLoading(true);

    let additionalData = {};
    if (role === 'paciente') {
      additionalData = {
        telefono: telefono,
        eps_id: epsId
      };
    } else if (role === 'doctor') {
      additionalData = {
        telefono: telefono,
        especialidad_id: especialidadId,
        eps_id: epsId
      };
    }

    try {
      const result = await register(nombre, email, password, password_confirmation, role, additionalData);
      setLoading(false);

      if (result.success) {
        setSuccessMessage('¡Registro Exitoso! Tu cuenta ha sido creada correctamente. Redirigiendo al login...');
        setTimeout(() => {
          navigation.replace("Login");
        }, 2000);
      } else {
        console.log('Registration failed:', result.error);
        Alert.alert('Error en Registro', result.error || 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Unexpected error during registration:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContainer}>
          <Text style={styles.title}>🏥 Citas Médicas</Text>
          <Text style={styles.subtitle}>Crear Cuenta</Text>
        </Animatable.View>

        {successMessage ? (
          <Animatable.View animation="bounceIn" duration={800} style={styles.successContainer}>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
            <Animatable.View animation="slideInLeft" duration={600} delay={400} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={[styles.input, nombreError ? styles.inputError : null]}
                placeholder="Tu nombre completo"
                value={nombre}
                onChangeText={(text) => {
                  setNombre(text);
                  if (nombreError) validateNombre(text);
                }}
                autoCapitalize="words"
              />
              {nombreError ? <Animatable.Text animation="shake" style={styles.errorText}>{nombreError}</Animatable.Text> : null}
            </Animatable.View>

            <Animatable.View animation="slideInRight" duration={600} delay={600} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="tu@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? <Animatable.Text animation="shake" style={styles.errorText}>{emailError}</Animatable.Text> : null}
            </Animatable.View>

            <Animatable.View animation="slideInLeft" duration={600} delay={800} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                  if (confirmPasswordError && password_confirmation) {
                    validateConfirmPassword(password_confirmation);
                  }
                }}
              />
              {passwordError ? <Animatable.Text animation="shake" style={styles.errorText}>{passwordError}</Animatable.Text> : null}
            </Animatable.View>

            <Animatable.View animation="slideInRight" duration={600} delay={1000} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput
                style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                placeholder="Repite tu contraseña"
                secureTextEntry
                value={password_confirmation}
                onChangeText={(text) => {
                  setPasswordConfirmation(text);
                  if (confirmPasswordError) validateConfirmPassword(text);
                }}
              />
              {confirmPasswordError ? <Animatable.Text animation="shake" style={styles.errorText}>{confirmPasswordError}</Animatable.Text> : null}
            </Animatable.View>

            <Animatable.View animation="zoomIn" duration={600} delay={1200} style={styles.roleContainer}>
              <Text style={styles.inputLabel}>Tipo de cuenta:</Text>
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'paciente' && styles.roleButtonSelected]}
                  onPress={() => setRole('paciente')}
                >
                  <Text style={[styles.roleButtonText, role === 'paciente' && styles.roleButtonTextSelected]}>👤 Paciente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'doctor' && styles.roleButtonSelected]}
                  onPress={() => setRole('doctor')}
                >
                  <Text style={[styles.roleButtonText, role === 'doctor' && styles.roleButtonTextSelected]}>👨‍⚕️ Doctor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'admin' && styles.roleButtonSelected]}
                  onPress={() => setRole('admin')}
                >
                  <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextSelected]}>⚙️ Administrador</Text>
                </TouchableOpacity>
              </View>
              {roleError ? <Animatable.Text animation="shake" style={styles.errorText}>{roleError}</Animatable.Text> : null}
            </Animatable.View>

            {role === 'paciente' && (
              <>
                <Animatable.View animation="slideInUp" duration={600} delay={1300} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu número de teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </Animatable.View>

                <Animatable.View animation="slideInUp" duration={600} delay={1350} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>EPS</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={epsId}
                      onValueChange={(itemValue) => setEpsId(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona una EPS" value="" />
                      {epsList.map((eps) => (
                        <Picker.Item key={eps.id} label={eps.nombre} value={eps.id.toString()} />
                      ))}
                    </Picker>
                  </View>
                </Animatable.View>
              </>
            )}

            {role === 'doctor' && (
              <>
                <Animatable.View animation="slideInUp" duration={600} delay={1300} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu número de teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </Animatable.View>

                <Animatable.View animation="slideInUp" duration={600} delay={1350} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Especialidad</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={especialidadId}
                      onValueChange={(itemValue) => setEspecialidadId(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona una especialidad" value="" />
                      {especialidadesList.map((especialidad) => (
                        <Picker.Item key={especialidad.id} label={especialidad.nombre} value={especialidad.id.toString()} />
                      ))}
                    </Picker>
                  </View>
                </Animatable.View>

                <Animatable.View animation="slideInUp" duration={600} delay={1400} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>EPS</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={epsId}
                      onValueChange={(itemValue) => setEpsId(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona una EPS" value="" />
                      {epsList.map((eps) => (
                        <Picker.Item key={eps.id} label={eps.nombre} value={eps.id.toString()} />
                      ))}
                    </Picker>
                  </View>
                </Animatable.View>
              </>
            )}

            <Animatable.View animation="pulse" duration={600} delay={1500}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeIn" duration={600} delay={1600} style={styles.footerContainer}>
              <TouchableOpacity onPress={() => navigation.replace("Login")}>
                <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleButtonsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  roleButtonTextSelected: {
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  successMessage: {
    fontSize: 18,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginTop: 8,
  },
  picker: {
    height: 50,
    color: '#333',
  },
});

export default RegisterScreen;
