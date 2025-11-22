import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

  // 🟢 PARAMETROS QUE LLEGAN DESDE FINANZAS
  const { fromFinance, income, expenses, balance } = useLocalSearchParams();

  // 🟢 MENSAJE AUTOMÁTICO AL ENTRAR DESDE FINANZAS
  useEffect(() => {
    if (String(fromFinance) === "true") {
      const welcomeMessage = `
Veo que vienes desde tu sección de **Finanzas**.

Aquí tengo tus datos más recientes:

- **Ingresos:** $${income}
- **Gastos:** $${expenses}
- **Balance actual:** $${balance}

¿Quieres que analice tu situación y te dé una recomendación personalizada?
      `;

      setMessages((prev) => [...prev, { from: "bot", text: welcomeMessage }]);
    }
  }, [fromFinance]);

  // 🔹 Consulta REAL a Gemini
  const getAIResponse = async (prompt: string) => {
    console.log("API KEY usada:", process.env.EXPO_PUBLIC_GEMINI_API_KEY);

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
Eres un asesor financiero experto dentro de una aplicación móvil.

DATOS DEL USUARIO (si están disponibles):
- Ingresos: ${income ?? "no proporcionado"}
- Gastos: ${expenses ?? "no proporcionado"}
- Balance: ${balance ?? "no proporcionado"}

REGLAS:
- Siempre usa los datos del usuario para generar recomendaciones personalizadas.
- Si el usuario responde “sí”, “dale”, “ok” o similar, debes usar los datos para hacer un análisis automático.
- Habla de forma clara, directa y amigable.

Mensaje del usuario:
"${prompt}"

Ahora genera la mejor respuesta financiera posible.
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
              {msg.from === "user" ? (
                <Text style={[styles.msgText, styles.userText]}>
                  {msg.text}
                </Text>
              ) : (
                <Markdown
                  style={{
                    body: { color: "#000000", fontSize: 15, lineHeight: 22 }, // negro
                    strong: { color: "#050609" }, // negrita oscura
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

  // 🟡 BURBUJA USUARIO
  message: {
    maxWidth: "85%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#CFF008",
    borderWidth: 1,
    borderColor: "#CFF008",
  },
  userText: {
    color: "#050609",
    fontWeight: "600",
    fontSize: 15,
  },

  // ⚪ BURBUJA BOT
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  msgText: {
    fontSize: 15,
    lineHeight: 20,
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
