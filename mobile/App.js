import React, { useEffect } from "react";
import * as Notifications from 'expo-notifications';
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

  return <AppNavigator />;
}
