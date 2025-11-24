import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CoursesScreen() {
  const { session } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <View style={{ flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  // Si el usuario NO es premium
  if (user?.status !== "premium") {
    return (
      <View style={{ flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: "#fff", fontSize: 20, textAlign: "center", fontWeight: "600" }}>
          You need to upgrade to the Premium plan to access these courses.
        </Text>
      </View>
    );
  }

  // Si es premium, mostramos la lista completa
  return (
    <View style={{ flex: 1, backgroundColor: "#050609", paddingTop: 15 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 50 }}>
        {sections.map((section, index) => (
          <View key={index} style={{ marginBottom: 35 }}>
            {/* 🔹 CATEGORY NAME */}
            <Text
              style={{
                color: "#CFF008",
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 16,
                marginLeft: 4,
              }}
            >
              {section.category}
            </Text>

            {/* 🔹 LIST OF COURSES */}
            {section.courses.map((title, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#0A0A0A",
                  borderWidth: 1,
                  borderColor: "#55610eff",
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={32}
                  color="#CFF008"
                  style={{ marginRight: 16 }}
                />

                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
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
    </View>
  );
}
