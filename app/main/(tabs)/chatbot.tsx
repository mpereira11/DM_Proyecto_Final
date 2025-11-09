import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Chatbot() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "user" | "bot"; text: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Consulta a Gemini
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
      setError("Error al conectar con Gemini.");
      return "Lo siento, tuve un problema procesando tu mensaje.";
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Enviar mensaje del usuario
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const reply = await getAIResponse(userMessage);
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Mensajes */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ padding: 16 }}
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
            <Text
              style={[
                styles.msgText,
                msg.from === "user" ? styles.userText : styles.botText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <ActivityIndicator size="small" color="#007aff" />
            <Text style={{ color: "#777", marginTop: 5 }}>
              Gemini está pensando...
            </Text>
          </View>
        )}

        {error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : null}
      </ScrollView>

      {/* Input fijo que se mueve con el teclado */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? tabBarHeight : tabBarHeight - 5
        }
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#888"
            style={styles.input}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9fb",
  },
  chatContainer: {
    flex: 1,
  },
  message: {
    marginVertical: 6,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#007aff",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f3",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#007aff",
    borderRadius: 50,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
