import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function OnboardingScreen({ user, onComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName.trim()) return Alert.alert("Name required", "What's your name on the course?");
    if (!bio.trim()) return Alert.alert("Bio needed", "Tell us your golf vibe!");
    if (!interests.trim()) return Alert.alert("Add interests", "What kind of golf do you love?");

    const interestsArr = interests.split(",").map(s => s.trim()).filter(Boolean);
    if (interestsArr.length === 0) return Alert.alert("Add at least one interest");

    setLoading(true);
    try {
      const profileData = {
        uid: user.uid,
        displayName: displayName.trim(),
        handicap: handicap || null,
        bio: bio.trim(),
        interests: interestsArr,
        photoUrl: user.photoURL || null,
        email: user.email,
        createdAt: new Date().toISOString(),
      };

      await Promise.all([
        setDoc(doc(db, "users", user.uid), profileData),
        setDoc(doc(db, "cards", user.uid), {
          cardId: user.uid,
          ...profileData,
        }),
      ]);

      onComplete(); // THIS GOES TO HOME
    } catch (e) {
      Alert.alert("Error", "Failed to save profile. Try again.");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, paddingTop: 100 }}>
          <Text style={styles.logo}>FairwayConnect</Text>
          <Text style={styles.title}>Complete Your Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Jordan S."
              placeholderTextColor="#64748b"
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Handicap (optional)</Text>
            <TextInput
              style={styles.input}
              value={handicap}
              onChangeText={setHandicap}
              placeholder="e.g. 8.4"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Low handicapper chasing birdies..."
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Golf Interests (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={interests}
              onChangeText={setInterests}
              placeholder="Skins, Match Play, Scramble..."
              placeholderTextColor="#64748b"
            />
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.finishText}>Start Swiping</Text>
                <Ionicons name="arrow-forward" size={28} color="#fff" style={{ marginLeft: 12 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = {
  logo: {
    fontSize: 56,
    fontWeight: "900",
    color: "#22c55e",
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 50,
  },
  inputGroup: { marginBottom: 28 },
  label: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    padding: 20,
    borderRadius: 22,
    fontSize: 17,
    borderWidth: 1.5,
    borderColor: "rgba(34,197,94,0.4)",
  },
  bioInput: { height: 130, paddingTop: 20 },
  finishBtn: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 22,
    borderRadius: 32,
    marginTop: 40,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 30,
  },
  finishText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
};