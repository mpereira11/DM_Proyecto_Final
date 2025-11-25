import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons"; // Importamos Ionicons para los iconos
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Colores basados en tu diseño (igual que LoginScreen)
const ACCENT_COLOR = "#CFF008"; // Verde/Amarillo Neón
const BG_COLOR = "#0A0A0A"; // Fondo oscuro de las tabs/header
const CARD_COLOR = "#1C1C1E"; // Fondo ligeramente más claro para el contenedor de inputs
const TEXT_COLOR = "#FFFFFF"; // Texto principal
const INACTIVE_COLOR = "#777777"; // Color de placeholders

export default function RegisterScreen() {
  const router = useRouter();
  // Asumiendo que useAuth está en "@/contexts/AuthContext" y expone signUp y loading
  const { signUp, loading } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para manejar errores de forma segura (como en LoginScreen)
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

  const handleRegister = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    if (!accepted) {
      Alert.alert("Notice", "You must accept the terms and privacy policy.", [{ text: "OK", style: "cancel" }]);
      return;
    }

    try {
      const session = await signUp(email, password, {
        name,
        username,
      });

      if (session) {
        Alert.alert(
          "Success",
          "Account created successfully! You can now log in.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        );
      } else {
        Alert.alert(
          "Notice",
          "Account created. Please check your email for verification.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        );
      }
    } catch (error) {
      safeHandleError(error, "Registration Failed");
    }
  };

  return (
    <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        style={styles.container}
        keyboardShouldPersistTaps="handled" // Para que el teclado se cierre correctamente
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us and manage your finances securely.</Text>

      {/* Input de Name */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={INACTIVE_COLOR}
        />
      </View>

      {/* Input de Username */}
      <View style={styles.inputContainer}>
        <Ionicons name="at-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={INACTIVE_COLOR}
          autoCapitalize="none"
        />
      </View>

      {/* Input de Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={INACTIVE_COLOR}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Input de Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={INACTIVE_COLOR}
          secureTextEntry={!showPassword}
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

      {/* Input de Confirm Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={ACCENT_COLOR} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor={INACTIVE_COLOR}
          secureTextEntry={!showConfirmPassword}
        />
         <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
            <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={INACTIVE_COLOR} 
            />
        </TouchableOpacity>
      </View>

      {/* Casilla de políticas */}
      <Pressable
        style={styles.policyContainer}
        onPress={() => setAccepted(!accepted)}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Ionicons name="checkmark" size={16} color={BG_COLOR} />}
        </View>
        <Text style={styles.policyText}>
          I accept the terms and privacy policies
        </Text>
      </Pressable>

      {/* Botón de Registro */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={BG_COLOR} />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Enlace para volver al Login */}
      <Text
        style={styles.backText}
        onPress={() => router.replace("/(auth)/login")}
      >
        Already have an account? <Text style={styles.link}>Login</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 50, // Añade padding vertical para evitar que el teclado oculte el contenido
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
    marginBottom: 30,
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
    marginBottom: 15, // Más compacto para acomodar más campos
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
  eyeIcon: {
    paddingLeft: 10,
  },
  policyContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: INACTIVE_COLOR,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
  },
  policyText: {
    fontSize: 14,
    color: TEXT_COLOR,
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