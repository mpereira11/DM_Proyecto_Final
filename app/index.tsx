import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SplashScreen from './splashScreen';

// Tiempo mínimo que queremos mostrar la Splash Screen (1000ms = 1 segundo)
const MINIMUM_SPLASH_TIME = 1000; 

export default function Index() {
  // Estado de autenticación del contexto
  const { session, loading } = useAuth(); 
  
  // Estado local para rastrear si el tiempo mínimo de 1 segundo ha pasado
  const [isTimedOut, setIsTimedOut] = useState(false); 

  // 1. Efecto para manejar el tiempo mínimo de visualización
  useEffect(() => {
    const timer = setTimeout(() => {
      // Marcamos que ha pasado el tiempo mínimo de 1 segundo
      setIsTimedOut(true);
    }, MINIMUM_SPLASH_TIME);

    return () => clearTimeout(timer); // Limpieza del temporizador
  }, []);
  
  // 🟢 LÓGICA DE VISUALIZACIÓN DE SPLASH SCREEN
  // La Splash Screen se muestra si:
  // a) La autenticación aún está cargando (loading es true)
  // O
  // b) El tiempo mínimo de 1 segundo no ha pasado (isTimedOut es false)
  if (loading || !isTimedOut) {
    return <SplashScreen />;
  }

  // 🔴 LÓGICA DE REDIRECCIÓN (Solo se ejecuta cuando loading es false Y isTimedOut es true)
  
  // Si hay una sesión, redirige a la aplicación principal.
  if (session) {
    return <Redirect href="/main/(tabs)/home" />;
  }
  
  // Si no hay sesión, redirige al Login.
  return <Redirect href="/(auth)/login" />;
}