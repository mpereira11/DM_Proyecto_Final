import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MainScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "user" | "bot"; text: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Función que consulta Gemini (ya adaptada a tu API actual)
  const getAIResponse = async (prompt: string) => {
    const body = {
      contents: [
        {
          parts: [
            {
              text: `
                Eres un asesor financiero amigable. 
                Responde de manera clara, breve y útil a las preguntas del usuario sobre 
                finanzas personales, ahorro e inversiones.
                Usuario: ${prompt}
              `,
            },
          ],
        },
      ],
    };

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      console.log("Gemini response:", data);

      if (
        !data ||
        !data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0].content?.parts?.length
      ) {
        throw new Error("Respuesta inválida de Gemini");
      }

      const rawText = data.candidates[0].content.parts[0].text;
      return rawText.trim();
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con Gemini.");
      return "Lo siento, tuve un problema procesando tu mensaje.";
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Enviar mensaje del usuario al chatbot
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");

    const reply = await getAIResponse(userMessage);
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={{ paddingVertical: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.message,
                msg.from === "user" ? styles.userMsg : styles.botMsg,
              ]}
            >
              <Text style={styles.msgText}>
                {msg.from === "bot" ? "🤖 " : "👤 "}
                {msg.text}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <ActivityIndicator size="small" color="#000" />
              <Text>Gemini está pensando...</Text>
            </View>
          )}
        </ScrollView>

        {error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu pregunta financiera..."
            placeholderTextColor="#000000"
            style={styles.input}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <Button title="Enviar" onPress={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatContainer: { flex: 1 },
  message: {
    marginVertical: 6,
    borderRadius: 10,
    padding: 10,
    maxWidth: "90%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f7c4",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
  },
  msgText: { fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },
});
