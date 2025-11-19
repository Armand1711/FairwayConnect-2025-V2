import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/ProfileScreenStyles";

export default function ProfileScreen({ user, onClose, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handicap, setHandicap] = useState("");
  const [interests, setInterests] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const ref = doc(db, "cards", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || user.displayName || "");
        setBio(data.bio || "");
        setHandicap(data.handicap || "");
        setInterests(data.interests || []);
        setPhotoUrl(data.photoUrl || user.photoURL || "");
      } else {
        setDisplayName(user.displayName || "");
        setPhotoUrl(user.photoURL || "");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load profile.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "cards", user.uid), {
        displayName,
        bio,
        handicap,
        interests,
        photoUrl,
      });
      Alert.alert("Saved", "Profile updated perfectly!", [
        { text: "Done", onPress: onClose },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to save. Try again.");
    }
    setSaving(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (i) => setInterests(interests.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Edit Profile</Text>

          {/* Avatar — FIXED: No more require() error */}
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  photoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName.charAt(0) || "G"
                  )}&background=1e293b&color=22c55e&size=280&bold=true&rounded=true`,
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Low handicapper chasing birdies and good vibes..."
              placeholderTextColor="#64748b"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Handicap</Text>
            <TextInput
              style={styles.input}
              value={handicap}
              onChangeText={setHandicap}
              placeholder="e.g. 8.4"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Interests */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Golf Interests</Text>
            <View style={styles.interestInputRow}>
              <TextInput
                style={styles.interestInput}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Scramble, Match Play, Skins..."
                placeholderTextColor="#64748b"
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity onPress={addInterest} style={styles.addBtn}>
                <Ionicons name="add" size={28} color="#22c55e" />
              </TouchableOpacity>
            </View>

            <View style={styles.chipsContainer}>
              {interests.map((interest, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                  <TouchableOpacity onPress={() => removeInterest(i)}>
                    <Ionicons name="close" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile</Text>
            )}
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}