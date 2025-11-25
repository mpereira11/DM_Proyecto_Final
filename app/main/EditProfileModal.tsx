import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { supabase } from "../../utils/supabase";
import * as FileSystem from "expo-file-system/legacy";
import { decode as decodeBase64 } from "base64-arraybuffer";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated: () => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState<string | null>(user?.profile_pic_url || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, // 🔥 Necesario para subir con base64
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ------------------------------------------
  //   🔥 LÓGICA CORRECTA: SUBIDA CON BASE64
  //   Igual al archivo 3/4 pero adaptado a tu tabla
  // ------------------------------------------
  const uploadAvatarBase64 = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true);

      // 1. Leer archivo en base64
      const base64File = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      if (!base64File) throw new Error("Could not read image file");

      // 2. Convertir a ArrayBuffer (igual que el proyecto viejo)
      const arrayBuffer = decodeBase64(base64File);

      // 3. Obtener extensión
      const ext =
        uri.split("?")[0].split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;

      // 4. (Opcional) eliminar imágenes anteriores del usuario
      try {
        const { data: list } = await supabase.storage
          .from("profile_pics")
          .list(user.id);

        if (list && list.length > 0) {
          const toRemove = list.map((file) => `${user.id}/${file.name}`);
          await supabase.storage.from("profile_pics").remove(toRemove);
        }
      } catch {}

      // 5. Subir archivo al bucket
      const { error: uploadErr } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg", // igual que proyecto viejo
        });

      if (uploadErr) throw uploadErr;

      // 6. Obtener URL pública
      const { data: publicUrl } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(filePath);

      return `${publicUrl.publicUrl}?v=${Date.now()}`;

    } catch (err: any) {
      Alert.alert("Error", err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    let uploadedUrl = user?.profile_pic_url;

    // Si la imagen viene de la galería (local), NO tiene https
    if (image && !image.startsWith("http")) {
      uploadedUrl = await uploadAvatarBase64(image);
    }

    const { error } = await supabase
      .from("users_app")
      .update({
        name,
        username,
        email,
        profile_pic_url: uploadedUrl,
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      onProfileUpdated();
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* FOTO DE PERFIL */}
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.emptyImage}>
              <MaterialIcons name="person" size={64} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>

        {/* INPUTS */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="User"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />

        {/* BOTÓN GUARDAR */}
        {uploading ? (
          <ActivityIndicator color="#8A2BE2" />
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = "#CFF008";

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#111111ff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: PRIMARY,
    marginBottom: 16,
  },
  emptyImage: {
    width: 110,
    height: 110,
    borderRadius: 70,
    backgroundColor: "#23262F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    backgroundColor: "#0f0f0f",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButton: {
    width: "100%",
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  saveText: {
    color: "#1a1a1aff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    width: "100%",
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#ccc",
  },
});
