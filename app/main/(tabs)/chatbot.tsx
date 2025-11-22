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
import Markdown from "react-native-markdown-display";

export default function Chatbot() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "user" | "bot"; text: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Consulta REAL a Gemini
  const getAIResponse = async (prompt: string) => {
    console.log("API KEY usada:", process.env.EXPO_PUBLIC_GEMINI_API_KEY);
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
      console.log("STATUS:", response.status);
      const data = await response.json();
      console.log("GEMINI RESP:", data);

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

  // Enviar mensaje
  const handleSend = async () => {
    if (!input.trim()) return;

    const msg = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    setInput("");

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);

    const reply = await getAIResponse(msg);
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.container}>
        
        {/* Chat */}
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
              {/* USER TEXT */}
              {msg.from === "user" ? (
                <Text style={[styles.msgText, styles.userText]}>
                  {msg.text}
                </Text>
              ) : (
                /* BOT TEXT with MARKDOWN */
                <Markdown
                  style={{
                    body: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
                    strong: { color: "#CFF008" },
                    bullet_list: { marginVertical: 4 },
                    ordered_list: { marginVertical: 4 },
                    list_item: { marginVertical: 2 },
                  }}
                >
                  {msg.text}
                </Markdown>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <ActivityIndicator size="small" color="#CFF008" />
              <Text style={{ color: "#CFF008", marginTop: 5 }}>
                IA pensando...
              </Text>
            </View>
          )}

          {error ? (
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          ) : null}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type something..."
            placeholderTextColor="#777"
            style={styles.input}
            multiline
            autoCorrect={true}
            autoCapitalize="sentences"
            autoComplete="off"
            enablesReturnKeyAutomatically={true}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#050609" />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050609",
  },

  chatContainer: {
    flex: 1,
  },

  message: {
    maxWidth: "85%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },

  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#2B2D33",
  },

  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#0F1013",
    borderWidth: 1,
    borderColor: "#CFF008",
  },

  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },

  userText: {
    color: "#FFFFFF",
  },

  botText: {
    color: "#FFFFFF",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#111217",
    borderRadius: 8,
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
  },

  sendButton: {
    backgroundColor: "#CFF008",
    padding: 10,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
