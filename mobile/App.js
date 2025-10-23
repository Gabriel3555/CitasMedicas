import React, { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Punto de entrada principal de la aplicación móvil
export default function App() {
  useEffect(() => {
    // Solicitar permisos de notificación al iniciar la app
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de notificación para recibir recordatorios.');
        return;
      }

      // Programar notificación cada 5 minutos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio',
          body: 'Recuerda revisar tus citas médicas.',
          sound: 'default',
        },
        trigger: {
          seconds: 300, // 5 minutos
          repeats: true,
        },
      });
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    // Handle deep links
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('Received deep link:', url);

      // Simple URL parsing for React Native Linking
      if (url.includes('reset-password')) {
        try {
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('token');
          const email = urlObj.searchParams.get('email');

          if (token && email) {
            // Store deep link data for navigation
            global.deepLinkData = {
              screen: 'ResetPassword',
              params: {
                token: token,
                email: email
              }
            };
            console.log('Deep link to reset password:', { token, email });
          }
        } catch (error) {
          console.error('Error parsing deep link URL:', error);
        }
      }
    };

    // Clear deep link data after a delay to allow navigation to complete
    const clearDeepLinkData = () => {
      setTimeout(() => {
        global.deepLinkData = null;
      }, 1000);
    };

    clearDeepLinkData();

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL when app is opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription?.remove();
  }, []);

  return <AppNavigator />;
}
