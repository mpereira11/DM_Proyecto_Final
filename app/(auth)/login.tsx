import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Colores basados en tu diseño
const ACCENT_COLOR = "#CFF008"; // Verde/Amarillo Neón
const BG_COLOR = "#0A0A0A"; // Fondo oscuro de las tabs/header
const CARD_COLOR = "#1C1C1E"; // Fondo ligeramente más claro para el contenedor de inputs
const TEXT_COLOR = "#FFFFFF"; // Texto principal
const INACTIVE_COLOR = "#777777"; // Color de placeholders

export default function LoginScreen() {
  const router = useRouter();
  // Asumiendo que useAuth está en "@/contexts/AuthContext" y expone signIn y loading
  const { signIn, loading } = useAuth(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  // Simulación de una función para manejar el olvido de contraseña
  const handleForgotPassword = () => {
      Alert.alert(
          "Password Reset", 
          "A password reset link has been sent to your email. (Feature placeholder)",
          [{ text: "OK", style: "cancel" }]
      );
  };

  const handleLogin = async () => {
    // Reemplazado Alert.alert por un manejo de errores más elegante
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    try {
      // Intentar iniciar sesión
      const session = await signIn(email, password);

      if (session) {
        // Navegación exitosa
        router.replace("/main/(tabs)/home");

      } else {
        // Si signIn no devuelve session pero tampoco lanza error
        Alert.alert("Error", "Invalid credentials or user does not exist.");
      }
    } catch (error) {
      // ✅ CORRECCIÓN CLAVE: Manejo seguro del tipo 'unknown' del error
      let errorMessage = "An unknown error occurred. Please try again.";
      
      if (error instanceof Error) {
        // Si es una instancia de Error, usamos su mensaje
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        // Si es un objeto que contiene una propiedad 'message' de tipo string (común en Firebase/Auth)
        errorMessage = error.message;
      }
      
      console.error("Login failed:", error);
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to access your financial dashboard.</Text>

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
        />
      </View>

      {/* Input de Contraseña */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={INACTIVE_COLOR}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={INACTIVE_COLOR} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Forgot Password Link */}
      <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={() => router.replace("/(auth)/resetPassword")}
          disabled={loading}
      >
        <Text style={styles.forgotPasswordText}>
          Forgot your password?
        </Text>
      </TouchableOpacity>


      {/* Botón de Login */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={BG_COLOR} />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Enlace de Registro */}
      <Text
        style={styles.signupText}
        onPress={() => router.replace("/(auth)/register")}
      >
        Don't have an account? <Text style={styles.link}>Sign up!</Text>
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_COLOR, // Borde por defecto
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: '600',
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
  signupText: {
    color: TEXT_COLOR,
    fontSize: 16,
  },
  link: {
    fontWeight: "bold",
    color: ACCENT_COLOR,
  },
});