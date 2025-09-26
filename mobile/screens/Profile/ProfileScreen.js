import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, TextInput, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { me, uploadProfilePhoto, changePassword, updateProfile, updatePatientProfile, updateDoctorProfile } from '../../apis/authApi';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const result = await me();

      if (result.success) {
        setUser(result.data);

        if (result.data.photo_url) {
          // Verificar si la URL es válida
          if (typeof result.data.photo_url === 'string' && result.data.photo_url.trim() !== '') {
            setPhotoLoading(true);
            setPhoto(result.data.photo_url);
            setPhotoLoading(false);
          }
        } else if (result.data.photo) {
          // Verificar si la URL es válida
          if (typeof result.data.photo === 'string' && result.data.photo.trim() !== '') {
            setPhotoLoading(true);
            setPhoto(result.data.photo);
            setPhotoLoading(false);
          }
        }
      } else {
        Alert.alert('Error', 'No se pudo cargar el perfil');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar el perfil');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectImageSource = () => {
    Alert.alert(
      'Seleccionar imagen',
      '¿De dónde quieres seleccionar la imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => openCamera() },
        { text: 'Galería', onPress: () => openGallery() },
      ],
    );
  };

  const openCamera = async () => {
    try {
      // Solicitar permisos de cámara
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const openGallery = async () => {
    try {
      // Solicitar permisos de galería
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (galleryPermission.status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setChangingPassword(false);

    if (result.success) {
      Alert.alert('Éxito', 'Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleEditProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Nombre y email son obligatorios');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // For patients and doctors, phone is also required
    if ((user.role === 'paciente' || user.role === 'doctor') && !editPhone.trim()) {
      Alert.alert('Error', `Teléfono es obligatorio para ${user.role === 'paciente' ? 'pacientes' : 'doctores'}`);
      return;
    }

    setUpdatingProfile(true);

    let result;
    if (user.role === 'paciente') {
      result = await updatePatientProfile(editName.trim(), editEmail.trim(), editPhone.trim());
    } else if (user.role === 'doctor') {
      result = await updateDoctorProfile(editName.trim(), editEmail.trim(), editPhone.trim());
    } else {
      result = await updateProfile(editName.trim(), editEmail.trim());
    }

    setUpdatingProfile(false);

    if (result.success) {
      Alert.alert('Éxito', 'Perfil actualizado exitosamente');
      // Reload user data to get updated information
      const userResult = await me();
      if (userResult.success) {
        setUser(userResult.data);
      }
      setShowEditProfileModal(false);
      setEditName('');
      setEditEmail('');
      setEditPhone('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const openEditProfileModal = () => {
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    if ((user.role === 'paciente' && user.paciente_profile) || (user.role === 'doctor' && user.doctor_profile)) {
      setEditPhone(
        user.role === 'paciente' ? (user.paciente_profile?.telefono || '') :
        user.role === 'doctor' ? (user.doctor_profile?.telefono || '') : ''
      );
    }
    setShowEditProfileModal(true);
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
                  setSelectedImage(null);
                  Alert.alert('Error', 'No se pudo cargar la imagen seleccionada');
                }}
              />
            ) : photo ? (
              <Image
                source={{ uri: photo }}
                style={styles.profilePhoto}
                onError={(error) => {
                  setPhoto(null);
                  Alert.alert('Error', 'No se pudo cargar la foto de perfil');
                }}
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

           {(user.role === 'paciente' && user.paciente_profile) || (user.role === 'doctor' && user.doctor_profile) ? (
             <View style={styles.infoField}>
               <Text style={styles.fieldLabel}>Teléfono:</Text>
               <Text style={styles.fieldValue}>
                 {user.role === 'paciente' ? (user.paciente_profile?.telefono || 'No especificado') :
                  user.role === 'doctor' ? (user.doctor_profile?.telefono || 'No especificado') :
                  'No especificado'}
               </Text>
             </View>
           ) : null}

           <View style={styles.infoField}>
             <Text style={styles.fieldLabel}>Rol:</Text>
             <Text style={styles.fieldValue}>
               {user.role === 'admin' ? '⚙️ Administrador' :
                user.role === 'doctor' ? '👨‍⚕️ Doctor' :
                user.role === 'paciente' ? '👤 Paciente' : 'Usuario'}
             </Text>
           </View>
         </View>

         <TouchableOpacity
           style={styles.editProfileButton}
           onPress={openEditProfileModal}
         >
           <Text style={styles.editProfileButtonText}>✏️ Editar Perfil</Text>
         </TouchableOpacity>

         <TouchableOpacity
           style={styles.changePasswordButton}
           onPress={() => setShowPasswordModal(true)}
         >
           <Text style={styles.changePasswordButtonText}>🔒 Cambiar Contraseña</Text>
         </TouchableOpacity>

       </Animatable.View>
 
       {/* Change Password Modal */}
       <Modal
         visible={showPasswordModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowPasswordModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
 
             <TextInput
               style={styles.input}
               placeholder="Contraseña actual"
               secureTextEntry
               value={currentPassword}
               onChangeText={setCurrentPassword}
             />
 
             <TextInput
               style={styles.input}
               placeholder="Nueva contraseña"
               secureTextEntry
               value={newPassword}
               onChangeText={setNewPassword}
             />
 
             <TextInput
               style={styles.input}
               placeholder="Confirmar nueva contraseña"
               secureTextEntry
               value={confirmPassword}
               onChangeText={setConfirmPassword}
             />
 
             <View style={styles.modalButtons}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={() => {
                   setShowPasswordModal(false);
                   setCurrentPassword('');
                   setNewPassword('');
                   setConfirmPassword('');
                 }}
               >
                 <Text style={styles.cancelButtonText}>Cancelar</Text>
               </TouchableOpacity>
 
               <TouchableOpacity
                 style={[styles.modalButton, styles.confirmButton]}
                 onPress={handleChangePassword}
                 disabled={changingPassword}
               >
                 <Text style={styles.confirmButtonText}>
                   {changingPassword ? 'Cambiando...' : 'Cambiar'}
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

       {/* Edit Profile Modal */}
       <Modal
         visible={showEditProfileModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowEditProfileModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Editar Perfil</Text>

             <TextInput
               style={styles.input}
               placeholder="Nombre completo"
               value={editName}
               onChangeText={setEditName}
             />

             <TextInput
               style={styles.input}
               placeholder="Email"
               keyboardType="email-address"
               autoCapitalize="none"
               value={editEmail}
               onChangeText={setEditEmail}
             />

             {(user.role === 'paciente' || user.role === 'doctor') && (
               <TextInput
                 style={styles.input}
                 placeholder="Teléfono"
                 keyboardType="phone-pad"
                 value={editPhone}
                 onChangeText={setEditPhone}
               />
             )}

             <View style={styles.modalButtons}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={() => {
                   setShowEditProfileModal(false);
                   setEditName('');
                   setEditEmail('');
                   setEditPhone('');
                 }}
               >
                 <Text style={styles.cancelButtonText}>Cancelar</Text>
               </TouchableOpacity>

               <TouchableOpacity
                 style={[styles.modalButton, styles.confirmButton]}
                 onPress={handleEditProfile}
                 disabled={updatingProfile}
               >
                 <Text style={styles.confirmButtonText}>
                   {updatingProfile ? 'Actualizando...' : 'Actualizar'}
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
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
  editProfileButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#28a745',
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