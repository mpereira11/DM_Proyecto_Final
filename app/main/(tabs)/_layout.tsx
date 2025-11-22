import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { Text, View } from "react-native";

export default function TabsLayout() {
  const pathname = usePathname();

  // Extraer solo el nombre final de la ruta:
  //  "/(tabs)/home"  → "home"
  //  "/main/(tabs)/chatbot" → "chatbot"
  const screen = pathname.split("/").pop();

  const titles: Record<string, string> = {
    home: "Home",
    FinanceScreen: "Finance",
    chatbot: "AI Assistant",
    newsScreen: "News",
    profile: "Profile",
  };

  const currentTitle = titles[screen ?? ""] ?? "";

  return (
    <View style={{ flex: 1, backgroundColor: "#050609" }}>
      {/* 🔥 HEADER FIJO GLOBAL */}
      <View
        style={{
          paddingTop: 45,
          paddingBottom: 12,
          backgroundColor: "#050609",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 26,
            fontWeight: "800",
          }}
        >
          {currentTitle}
        </Text>

        <View
          style={{
            marginTop: 8,
            width: "100%",
            height: 1.5,
            backgroundColor: "#CFF008",
          }}
        />
      </View>

      {/* 🔥 TABS */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#CFF008",
          tabBarInactiveTintColor: "#777",
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#0A0A0A",
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 2,
            borderTopColor: "#CFF008",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size + 4} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="FinanceScreen"
          options={{
            title: "Finance",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="stats-chart-outline"
                size={size + 4}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="chatbot"
          options={{
            title: "IA",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={size + 3}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="newsScreen"
          options={{
            title: "News",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="newspaper-outline"
                size={size + 3}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                size={size + 6}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
