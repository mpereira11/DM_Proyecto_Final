import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const session = await signIn(email, password);

      if (session) {
        router.replace("/main/(tabs)/home");

      } else {
        Alert.alert("Error", "Invalid credentials or user does not exist");

      }
    } catch (error: any) {
      Alert.alert("Login failed", error.message || "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Login"}
        </Text>
      </TouchableOpacity>
      <Text
        style={styles.signupText}
        onPress={() => router.replace("/(auth)/register")}
      >
        You don't have an account? <Text style={styles.link}>Sign up!</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 30
},

  input:{
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20
},

  button:{
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15
},
  buttonText:{
    color: "#000",
    fontWeight: "bold",
    fontSize: 16
},

  signupText:{
    color: "#000",
    fontSize: 14
},

  link:{
    fontWeight: "bold"
},

});
