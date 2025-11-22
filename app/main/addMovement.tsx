// app/add-movement.tsx
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type MovementType = "income" | "expense";

const CATEGORIES = [
  "Salary",
  "Bonus",
  "Freelance",
  "Refund",
  "Food",
  "Transport",
  "Groceries",
  "Leisure",
  "Clothes",
  "Health",
  "Education",
  "Investments",
  "Other",
];

export default function AddMovementScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [type, setType] = useState<MovementType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!session?.user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const numericAmount = Number(amount.replace(",", "."));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount greater than 0.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: session.user.id,
          amount: numericAmount,
          type,
          category,
          note: note || null,
        },
      ]);

      if (error) {
        console.error("Error inserting movement:", error.message);
        Alert.alert("Error", "Could not save movement.");
        return;
      }

      Alert.alert("Saved", "Movement registered successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const typeButtonStyle = (t: MovementType) => [
    styles.typeButton,
    type === t && styles.typeButtonActive,
  ];
  const typeTextStyle = (t: MovementType) => [
    styles.typeText,
    type === t && styles.typeTextActive,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add movement</Text>

        {/* Tipo */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={typeButtonStyle("income")}
            onPress={() => setType("income")}
          >
            <Text style={typeTextStyle("income")}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={typeButtonStyle("expense")}
            onPress={() => setType("expense")}
          >
            <Text style={typeTextStyle("expense")}>Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="$ 0"
          placeholderTextColor="#56585F"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipGroup}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                category === cat && styles.chipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Short description..."
          placeholderTextColor="#56585F"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save movement"}
          </Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050609",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    color: "#A0A3A7",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2B2D33",
    paddingVertical: 8,
    marginRight: 8,
    alignItems: "center",
  },
  typeButtonActive: {
    borderColor: "#CFF008",
    backgroundColor: "#181A1F",
  },
  typeText: {
    color: "#A0A3A7",
    fontSize: 14,
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#CFF008",
  },
  input: {
    backgroundColor: "#111217",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2B2D33",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2B2D33",
    marginBottom: 6,
  },
  chipActive: {
    borderColor: "#CFF008",
    backgroundColor: "#181A1F",
  },
  chipText: {
    color: "#A0A3A7",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#CFF008",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#CFF008",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#050609",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#A0A3A7",
    fontSize: 14,
  },
});
