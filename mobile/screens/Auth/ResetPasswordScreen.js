import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as Animatable from 'react-native-animatable';
import { resetPassword } from '../../apis/authApi';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Get token and email from navigation params
  const { token: paramToken, email: paramEmail } = route.params || {};

  // Manual entry states for when params are not provided
  const [manualEmail, setManualEmail] = useState(paramEmail || "");
  const [manualToken, setManualToken] = useState(paramToken || "");
  const [emailError, setEmailError] = useState("");
  const [tokenError, setTokenError] = useState("");

  // Use params if available, otherwise use manual entry
  const email = paramEmail || manualEmail;
  const token = paramToken || manualToken;

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
      setConfirmPasswordError("Debes confirmar la contraseña");
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("El email es requerido");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingresa un email válido");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validateToken = (token) => {
    if (!token) {
      setTokenError("El código de verificación es requerido");
      return false;
    } else if (token.length < 10) {
      setTokenError("El código de verificación debe tener al menos 10 caracteres");
      return false;
    } else {
      setTokenError("");
      return true;
    }
  };

  const handleResetPassword = async () => {
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    // Validate email and token if they need manual entry
    const needsManualEntry = !paramEmail || !paramToken;
    const isEmailValid = needsManualEntry ? validateEmail(email) : true;
    const isTokenValid = needsManualEntry ? validateToken(token) : true;

    if (!isPasswordValid || !isConfirmPasswordValid || !isEmailValid || !isTokenValid) {
      return;
    }

    if (!token || !email) {
      Alert.alert('Error', 'Token o email faltante. Solicita un nuevo enlace de recuperación.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, token, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      setPasswordChanged(true);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  if (passwordChanged) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContainer}>
            <Text style={styles.title}>🏥 Citas Médicas</Text>
            <Text style={styles.subtitle}>¡Contraseña Cambiada!</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.successContainer}>
            <Animatable.View animation="bounceIn" duration={1000} delay={400}>
              <Text style={styles.successIcon}>🎉</Text>
            </Animatable.View>

            <Text style={styles.successTitle}>¡Contraseña restablecida!</Text>
            <Text style={styles.successText}>
              Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </Text>

            <Animatable.View animation="pulse" duration={600} delay={800}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.buttonText}>Ir al inicio de sesión</Text>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.headerContainer}>
          <Text style={styles.title}>🏥 Citas Médicas</Text>
          <Text style={styles.subtitle}>Nueva Contraseña</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
          <Text style={styles.description}>
            Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
          </Text>

          {/* Show manual email input if not provided via params */}
          {(!paramEmail) && (
            <Animatable.View animation="slideInLeft" duration={600} delay={300} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="tuemail@ejemplo.com"
                value={manualEmail}
                onChangeText={(text) => {
                  setManualEmail(text);
                  if (emailError) validateEmail(text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? <Animatable.Text animation="shake" style={styles.errorText}>{emailError}</Animatable.Text> : null}
            </Animatable.View>
          )}

          {/* Show manual token input if not provided via params */}
          {(!paramToken) && (
            <Animatable.View animation="slideInRight" duration={600} delay={400} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Código de Verificación</Text>
              <TextInput
                style={[styles.input, tokenError ? styles.inputError : null]}
                placeholder="Ingresa el código del email"
                value={manualToken}
                onChangeText={(text) => {
                  setManualToken(text);
                  if (tokenError) validateToken(text);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {tokenError ? <Animatable.Text animation="shake" style={styles.errorText}>{tokenError}</Animatable.Text> : null}
            </Animatable.View>
          )}

          <Animatable.View animation="slideInLeft" duration={600} delay={500} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Tu nueva contraseña"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
                if (confirmPassword && confirmPasswordError) validateConfirmPassword(confirmPassword);
              }}
            />
            {passwordError ? <Animatable.Text animation="shake" style={styles.errorText}>{passwordError}</Animatable.Text> : null}
          </Animatable.View>

          <Animatable.View animation="slideInRight" duration={600} delay={600} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) validateConfirmPassword(text);
              }}
            />
            {confirmPasswordError ? <Animatable.Text animation="shake" style={styles.errorText}>{confirmPasswordError}</Animatable.Text> : null}
          </Animatable.View>

          <Animatable.View animation="pulse" duration={600} delay={800}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeIn" duration={600} delay={1000} style={styles.footerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.link}>← Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
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
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
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
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
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
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
});

export default ResetPasswordScreen;