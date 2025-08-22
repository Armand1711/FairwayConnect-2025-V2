import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function OnboardingScreen({ user, onComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!displayName.trim() || !bio.trim() || !interests.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    const interestsArr = interests
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (interestsArr.length === 0) {
      setErrorMsg("Please enter at least one interest.");
      return;
    }
    setLoading(true);
    try {
      // Save to 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: displayName.trim(),
        email: user.email,
        photoUrl: photoUrl.trim(),
        bio: bio.trim(),
        interests: interestsArr,
        createdAt: new Date().toISOString(),
      });
      // Save to 'cards' collection
      await setDoc(doc(db, "cards", user.uid), {
        cardId: user.uid,
        uid: user.uid,
        displayName: displayName.trim(),
        bio: bio.trim(),
        interests: interestsArr,
        photoUrl: photoUrl.trim(),
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      onComplete(); // callback to proceed to HomeScreen
    } catch (e) {
      setLoading(false);
      setErrorMsg(e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Onboarding</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
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
        {loading ? (
          <ActivityIndicator color="#228B22" />
        ) : (
          <Text style={styles.buttonText}>Complete Onboarding</Text>
        )}
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
  error: { color: "#b71c1c", backgroundColor: "#ffeeee", padding: 8, borderRadius: 8, marginBottom: 12, textAlign: "center" }
});