import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// Nota: Deberás importar 'supabase' desde tu archivo de utilidades
// o incluir la función 'sendPasswordResetEmail' en tu AuthContext si lo prefieres.
// import { supabase } from "@/utils/supabase"; 

// Colores basados en tu diseño
const ACCENT_COLOR = "#CFF008"; // Verde/Amarillo Neón
const BG_COLOR = "#0A0A0A"; // Fondo oscuro
const CARD_COLOR = "#1C1C1E"; // Fondo ligeramente más claro para el contenedor de inputs
const TEXT_COLOR = "#FFFFFF"; // Texto principal
const INACTIVE_COLOR = "#777777"; // Color de placeholders

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para manejar errores de forma segura (patrón utilizado en Login/Register)
  const safeHandleError = (error: unknown, title: string) => {
    let errorMessage = "An unknown error occurred. Please try again.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    
    console.error(`❌ Error en ${title}:`, error);
    Alert.alert(title, errorMessage);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    setLoading(true);

    try {
      // 🚨 IMPORTANTE: Aquí se debe realizar la llamada a Supabase.
      // 
      // Ejemplo usando Supabase directamente:
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: 'tu-esquema-de-redireccion-deep-link://reset-password',
      // });
      //
      // if (error) throw error;

      // --- SIMULACIÓN DE LLAMADA EXITOSA ---
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      // ------------------------------------

      Alert.alert(
        "Email Sent",
        "We have sent you a link to reset your password. Please check your inbox (and spam folder).",
        // Navegar de vuelta al login después de la confirmación
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error) {
      safeHandleError(error, "Password Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter the email address associated with your account and we will send you a reset link.
      </Text>

      {/* Input de Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={INACTIVE_COLOR}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      {/* Botón de Enviar Link */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={BG_COLOR} />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Enlace para volver al Login */}
      <Text
        style={styles.backText}
        onPress={() => router.replace("/(auth)/login")}
      >
        Remembered your password? <Text style={styles.link}>Back to Login</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_COLOR,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: INACTIVE_COLOR,
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    height: 55,
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 40, // Más espacio antes del botón
    borderWidth: 1,
    borderColor: CARD_COLOR,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    // Sombra sutil para el efecto neón
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: BG_COLOR,
    fontWeight: "bold",
    fontSize: 18,
  },
  backText: {
    color: TEXT_COLOR,
    fontSize: 16,
  },
  link: {
    fontWeight: "bold",
    color: ACCENT_COLOR,
  },
});