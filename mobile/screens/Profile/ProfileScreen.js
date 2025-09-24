import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { me, uploadProfilePhoto } from '../../apis/authApi';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...');
      const result = await me();
      console.log('API result:', result);

      if (result.success) {
        setUser(result.data);
        console.log('User data:', result.data);

        if (result.data.photo_url) {
          console.log('Photo URL from API:', result.data.photo_url);
          // Verificar si la URL es válida
          if (typeof result.data.photo_url === 'string' && result.data.photo_url.trim() !== '') {
            setPhotoLoading(true);
            setPhoto(result.data.photo_url);
            setPhotoLoading(false);
          } else {
            console.log('Photo URL is empty or invalid');
          }
        } else if (result.data.photo) {
          console.log('Using legacy photo field:', result.data.photo);
          // Verificar si la URL es válida
          if (typeof result.data.photo === 'string' && result.data.photo.trim() !== '') {
            setPhotoLoading(true);
            setPhoto(result.data.photo);
            setPhotoLoading(false);
          } else {
            console.log('Photo URL is empty or invalid');
          }
        } else {
          console.log('No photo found in user data');
        }
      } else {
        console.error('API error:', result);
        Alert.alert('Error', 'No se pudo cargar el perfil');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Error al cargar el perfil');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectImageSource = () => {
    console.log('selectImageSource called');
    console.log('Available options:', ['Cámara', 'Galería']);
    Alert.alert(
      'Seleccionar imagen',
      '¿De dónde quieres seleccionar la imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => {
          console.log('Camera option selected');
          openCamera();
        }},
        { text: 'Galería', onPress: () => {
          console.log('Gallery option selected');
          openGallery();
        }},
      ],
    );
  };

  const openCamera = async () => {
    try {
      console.log('Opening camera...');
      console.log('Requesting camera permissions...');

      // Solicitar permisos de cámara
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      console.log('Camera permission result:', cameraPermission);

      if (cameraPermission.status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la cámara');
        return;
      }

      console.log('Camera permission granted');

      console.log('Launching camera with options:', {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled) {
        console.log('Image selected:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log('User cancelled camera');
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const openGallery = async () => {
    try {
      console.log('Opening gallery...');
      console.log('Requesting gallery permissions...');

      // Solicitar permisos de galería
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log('Gallery permission result:', galleryPermission);

      if (galleryPermission.status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      console.log('Gallery permission granted');

      console.log('Launching gallery with options:', {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Gallery result:', result);

      if (!result.canceled) {
        console.log('Image selected from gallery:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log('User cancelled gallery');
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const uploadPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Por favor selecciona una imagen primero');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProfilePhoto(selectedImage);
      if (result.success) {
        setUser(result.data.user);
        setPhoto(result.data.user.photo);
        setSelectedImage(null);
        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = () => {
    if (uploading) {
      Alert.alert('Info', 'Ya se está subiendo una imagen. Espera un momento.');
      return;
    }

    selectImageSource();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.profileContainer}>
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={handlePhotoUpload} style={styles.photoButton}>
            {photoLoading ? (
              <View style={[styles.profilePhoto, styles.photoLoading]}>
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            ) : selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.profilePhoto}
                onError={(error) => {
                  console.error('Error loading selected image:', error);
                  setSelectedImage(null);
                  Alert.alert('Error', 'No se pudo cargar la imagen seleccionada');
                }}
              />
            ) : photo ? (
              <Image
                source={{ uri: photo }}
                style={styles.profilePhoto}
                onError={(error) => {
                  console.error('Error loading profile photo:', error);
                  console.error('Photo URL that failed:', photo);
                  setPhoto(null);
                  Alert.alert('Error', 'No se pudo cargar la foto de perfil');
                }}
                onLoadStart={() => console.log('Starting to load image:', photo)}
                onLoadEnd={() => console.log('Finished loading image:', photo)}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </Text>
                {!photo && !photoLoading && (
                  <Text style={styles.noPhotoText}>Sin foto</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
            <Text style={styles.uploadButtonText}>📷 Cambiar Foto</Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={uploadPhoto}
              disabled={uploading}
            >
              <Text style={styles.confirmButtonText}>
                {uploading ? 'Subiendo...' : '✓ Confirmar Foto'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Nombre:</Text>
            <Text style={styles.fieldValue}>{user.name || 'No especificado'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Email:</Text>
            <Text style={styles.fieldValue}>{user.email || 'No especificado'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Rol:</Text>
            <Text style={styles.fieldValue}>⚙️ Administrador</Text>
          </View>
        </View>

      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  profileContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoButton: {
    marginBottom: 15,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  photoPlaceholderText: {
    fontSize: 48,
    color: '#007AFF',
  },
  noPhotoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  photoLoading: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: '#6c757d',
    flex: 2,
    textAlign: 'right',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;