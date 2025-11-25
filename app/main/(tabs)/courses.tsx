import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";


export default function CoursesScreen() {
  const { session } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingModalVisible, setSavingModalVisible] = useState(false); // Estado para el modal de "Saving"

  const sections = [
    {
      category: "Personal Finance",
      courses: [
        "Saving",
        "Smart Budgeting",
        "Expense Tracking",
        "Emergency Fund",
        "Money Psychology",
        "Credit Card Management",
      ],
    },
    {
      category: "Investments",
      courses: [
        "Investing for Beginners",
        "Long-term Investing",
        "Index Funds",
        "ETFs and Mutual Funds",
        "Stock Market Basics",
        "Dividend Stocks",
        "Bonds (Fixed Income)",
      ],
    },
    {
      category: "Alternative Investments",
      courses: [
        "Cryptocurrency (Beginner)",
        "Cryptocurrency (Intermediate)",
        "Real Estate",
        "Real Estate Crowdfunding",
        "Gold & Precious Metals",
      ],
    },
    {
      category: "Debt Management",
      courses: [
        "Eliminating Debt",
        "Snowball vs Avalanche Method",
        "Negotiating with Banks",
        "Avoiding Financial Scams",
      ],
    },
    {
      category: "Financial Planning",
      courses: [
        "Retirement Planning",
        "Pension & Voluntary Savings",
        "Financial Education for Youth",
      ],
    },
    {
      category: "Business & Entrepreneurship",
      courses: [
        "Starting a Business from Scratch",
        "Financial Intelligence for Entrepreneurs",
        "Business Financial Control",
      ],
    },
    {
      category: "Taxes",
      courses: [
        "Taxes Introduction",
        "VAT, Income & Withholdings",
        "How to File Taxes",
      ],
    },
    {
      category: "Advanced Finance",
      courses: [
        "Day Trading",
        "Professional Trading",
        "Technical Analysis",
        "Fundamental Analysis",
        "Risk Management in Investments",
      ],
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("users_app")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        Alert.alert("Error", "Could not fetch user info");
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Si el usuario NO es premium
  if (user?.status !== "premium") {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumText}>
          You need to upgrade to the Premium plan to access these courses.
        </Text>
      </View>
    );
  }

  // Detectar si se selecciona el curso "Saving"
  const handleCoursePress = (courseTitle: string) => {
    if (courseTitle === "Saving") {
      setSavingModalVisible(true);
    } else {
      Alert.alert("Course selected", `You selected: ${courseTitle}`);
    }
  };

  // Si es premium, mostramos la lista completa
  return (
    <View style={{ flex: 1, backgroundColor: "#050609", paddingTop: 15 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 50 }}>
        {sections.map((section, index) => (
          <View key={index} style={{ marginBottom: 35 }}>
            {/* 🔹 CATEGORY NAME */}
            <Text style={styles.sectionTitle}>
              {section.category}
            </Text>

            {/* 🔹 LIST OF COURSES */}
            {section.courses.map((title, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                style={styles.courseItem}
                onPress={() => handleCoursePress(title)}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={32}
                  color="#CFF008"
                  style={{ marginRight: 16 }}
                />

                <Text
                  style={styles.courseTitle}
                >
                  {title}
                </Text>

                <View style={{ flex: 1 }} />

                <Ionicons
                  name="chevron-forward-outline"
                  size={26}
                  color="#CFF008"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Modal for "Saving" course */}
      <Modal
        visible={savingModalVisible}
        animationType="slide"
        onRequestClose={() => setSavingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Saving</Text>
            <View style={styles.modalHeaderLine} />
          </View>

          {/* Imagen del curso */}
          <Image
            source={require("../../../assets/images/saving-course.png")}
            style={styles.courseImage}
          />
          {/* Nota: cambiar la ruta por la imagen que quieras mostrar */}

          {/* Video del curso */}
            <View style={{ marginVertical: 20 }}>
              <YoutubePlayer
                height={220}                   // Altura del reproductor
                play={false}                   // No reproducir automáticamente
                videoId="HQzoZfc3GwQ"          // ID del video de YouTube
                initialPlayerParams={{ start: 0 }} // Empieza en el tiempo que quieres (262s)
              />
            </View>

          <Text style={styles.sectionHeading}>Definition</Text>
          <Text style={styles.sectionText}>
            Saving is the process of setting aside a portion of your income for future use. 
            It helps build financial security and achieve short- and long-term goals.
          </Text>

          <Text style={styles.sectionHeading}>Examples</Text>
          <Text style={styles.sectionText}>
            Examples include depositing money into a savings account, setting up an emergency fund, 
            or regularly investing in low-risk instruments.
          </Text>

          <Text style={styles.sectionHeading}>Analogy</Text>
          <Text style={styles.sectionText}>
            Think of saving like planting seeds: small actions today can grow into a strong financial tree in the future.
          </Text>

          <Text style={styles.sectionHeading}>Tips & Advice</Text>
          <Text style={styles.sectionText}>
            1. Automate your savings.{"\n"}
            2. Start with small amounts and increase gradually.{"\n"}
            3. Separate savings from spending money.{"\n"}
            4. Review your goals regularly.
          </Text>

          <Text style={styles.sectionHeading}>FAQ</Text>
          <Text style={styles.sectionText}>
            Q: How much should I save each month?{"\n"}
            A: Aim for at least 10–20% of your income, adjusting to your goals and expenses.
          </Text>

          <TouchableOpacity
            onPress={() => setSavingModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff" },
  premiumContainer: { flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  premiumText: { color: "#fff", fontSize: 20, textAlign: "center", fontWeight: "600" },
  sectionTitle: { color: "#CFF008", fontSize: 20, fontWeight: "700", marginBottom: 16, marginLeft: 4 },
  courseItem: { backgroundColor: "#050609", borderWidth: 1, borderColor: "#55610eff", borderRadius: 14, padding: 18, marginBottom: 16, flexDirection: "row", alignItems: "center" },
  courseTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  modalContainer: { flex: 1, backgroundColor: "#050609", padding: 20 },
  modalTitle: { fontSize: 26, fontWeight: "700", color: "#CFF008", marginBottom: 16 },
  courseImage: { width: "100%", height: 200, resizeMode: "contain", marginBottom: 20 },
  sectionHeading: { fontSize: 20, fontWeight: "700", color: "#CFF008", marginTop: 16, marginBottom: 8 },
  sectionText: { fontSize: 16, color: "#FFFFFF", lineHeight: 24 },
  closeButton: { marginTop: 30, backgroundColor: "#CFF008", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  closeButtonText: { color: "#131313", fontWeight: "700", fontSize: 18 },
  modalHeader: {alignItems: "center", marginBottom: 16,},
  modalHeaderText: {fontSize: 24, fontWeight: "700", color: "#FFFFFF",},
  modalHeaderLine: {marginTop: 4, width: "100%", height: 3, backgroundColor: "#CFF008", borderRadius: 2, },
});