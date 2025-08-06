import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView } from "react-native";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function OnboardingScreen({ user, onComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName || !bio || !interests) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Save to 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email: user.email,
        photoUrl,
        bio,
        interests: interests.split(",").map(s => s.trim()), // convert to array
        createdAt: new Date().toISOString(),
      });
      // Save to 'cards' collection
      await setDoc(doc(db, "cards", user.uid), {
        cardId: user.uid,
        uid: user.uid,
        displayName,
        bio,
        interests: interests.split(",").map(s => s.trim()),
        photoUrl,
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      onComplete(); // callback to proceed to HomeScreen
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Onboarding</Text>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <TextInput
        style={styles.input}
        placeholder="Interests (comma separated)"
        value={interests}
        onChangeText={setInterests}
      />
      <TextInput
        style={styles.input}
        placeholder="Photo URL"
        value={photoUrl}
        onChangeText={setPhotoUrl}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Complete Onboarding"}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#228B22", marginBottom: 24, textAlign: "center" },
  input: { height: 48, borderWidth: 1, borderColor: "#228B22", borderRadius: 12, marginBottom: 16, paddingHorizontal: 14, fontSize: 16 },
  button: { backgroundColor: "#FFD700", borderRadius: 18, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  buttonText: { color: "#228B22", fontWeight: "bold", fontSize: 18 },
});