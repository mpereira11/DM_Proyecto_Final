import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditProfileModal from "../EditProfileModal";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

// =========================
//   HELP MODAL
// =========================
function HelpModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={helpStyles.overlay}>
        <View style={helpStyles.modalBox}>
          <Text style={helpStyles.title}>Help & Support</Text>

          <ScrollView style={{ width: "100%" }}>
            <HelpItem
              question="How do I edit my profile?"
              answer="Go to 'Edit Profile' and update your name, username or profile picture."
            />
            <HelpItem
              question="How does the premium plan work?"
              answer="Premium users unlock additional features and improved performance."
            />
            <HelpItem
              question="How do I change my style theme?"
              answer="Tap on 'Style' in the menu to explore appearance options."
            />
            <HelpItem
              question="How can I reset my password?"
              answer="Password resets must be done from the login screen using 'Forgot password?'."
            />
            <HelpItem
              question="Why can't I log in?"
              answer="Check your email and password. If the issue persists, contact support."
            />
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={helpStyles.closeButton}>
            <Text style={helpStyles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function HelpItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View style={helpStyles.faqItem}>
      <Text style={helpStyles.question}>{question}</Text>
      <Text style={helpStyles.answer}>{answer}</Text>
    </View>
  );
}

// =========================
//   PREMIUM MODAL
// =========================
function PremiumPurchaseModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalBox}>
          <View style={modalStyles.iconBox}>
            <Feather name="star" size={50} color="#181A20" />
          </View>

          <Text style={modalStyles.title}>Improve Plan</Text>

          <Text style={modalStyles.description}>
            Get access to premium features for just{" "}
            <Text style={{ color: "#C6FF00", fontWeight: "bold" }}>$20</Text>.
          </Text>

          <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm}>
            <Text style={modalStyles.confirmText}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// =========================
//   PROFILE SCREEN
// =========================
export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("users_app")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        Alert.alert("Error", "Could not load profile");
      } else {
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [session]);

  const handleProfileUpdated = async () => {
    setEditVisible(false);
    setLoading(true);

    const { data } = await supabase
      .from("users_app")
      .select("*")
      .eq("email", session.user.email)
      .single();

    setUser(data);
    setLoading(false);
  };

  // =========================
  //   UPGRADE PLAN
  // =========================
  const handleUpgradePlan = async () => {
    try {
      const { error } = await supabase
        .from("users_app")
        .update({ status: "premium" })
        .eq("email", session.user.email);

      if (error) throw error;

      setPremiumVisible(false);
      handleProfileUpdated();

      Alert.alert("You are now a Premium user!");
    } catch (e) {
      Alert.alert("Error", "Could not upgrade plan");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CENTER SECTION */}
        <View style={styles.centerSection}>
          {user?.profile_pic_url ? (
            <Image
              source={{ uri: user.profile_pic_url }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.profileImage,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#23262F",
                },
              ]}
            >
              <MaterialIcons name="person" size={64} color="#aaa" />
            </View>
          )}

          <Text style={styles.name}>{user?.name || "name"}</Text>
          <Text style={styles.username}>User: {user?.username || "user"}</Text>
        </View>

        {/* MENU */}
        <View style={styles.menuWrapper}>
          <View style={styles.menu}>
            <MenuOption
              icon={<Feather name="edit" size={24} color="#181A20" />}
              label="Edit Profile"
              onPress={() => setEditVisible(true)}
            />

            <MenuOption
              icon={
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color="#181A20"
                />
              }
              label="Style"
              onPress={() => {}}
            />

            {user?.status === "basic" && (
              <MenuOption
                icon={<Feather name="trending-up" size={24} color="#181A20" />}
                label="Improve plan"
                onPress={() => setPremiumVisible(true)}
              />
            )}

            <MenuOption
              icon={<Feather name="settings" size={24} color="#181A20" />}
              label="Settings"
              onPress={() => {}}
            />

            <MenuOption
              icon={<Feather name="help-circle" size={24} color="#181A20" />}
              label="Help"
              onPress={() => setHelpVisible(true)}
            />

            <MenuOption
              icon={<MaterialIcons name="logout" size={24} color="#181A20" />}
              label="Logout"
              onPress={() =>
                Alert.alert("Close Session", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await signOut();
                        router.replace("/(auth)/login");
                      } catch (e: any) {
                        Alert.alert(
                          "Error",
                          e.message || "Could not log out."
                        );
                      }
                    },
                  },
                ])
              }
              labelStyle={{ color: "#e74c3c" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* MODALS */}
      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />

      <PremiumPurchaseModal
        visible={premiumVisible}
        onClose={() => setPremiumVisible(false)}
        onConfirm={handleUpgradePlan}
      />

      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </View>
  );
}

// =========================
//   MENU OPTION COMPONENT
// =========================
function MenuOption({
  icon,
  label,
  onPress,
  labelStyle,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  labelStyle?: any;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconBox}>{icon}</View>
      <Text style={[styles.menuText, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

// =========================
//   STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  scrollContent: {
    paddingHorizontal: 55,
    paddingTop: 32,
    width: "100%",
  },
  centerSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#C6FF00",
    marginBottom: 18,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  username: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  menuWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  menu: {
    width: "100%",
    marginTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#C6FF00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  menuText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

// =========================
//   PREMIUM MODAL STYLES
// =========================
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: "#181A20",
    width: "100%",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#C6FF00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#C6FF00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  confirmText: {
    color: "#181A20",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 6,
  },
});

// =========================
//   HELP MODAL STYLES
// =========================
const helpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#181A20",
    padding: 24,
    borderRadius: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C6FF00",
    marginBottom: 4,
  },
  answer: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#C6FF00",
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#181A20",
    fontSize: 18,
    fontWeight: "700",
  },
});
