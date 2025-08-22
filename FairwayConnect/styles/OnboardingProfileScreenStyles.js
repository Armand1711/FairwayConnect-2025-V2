import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function OnboardingProfileScreen({ user, onFinish }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFinish = async () => {
    setError("");
    if (!displayName || !bio || !interests) {
      setError("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const profileData = {
        uid: user.uid,
        displayName,
        email: user.email,
        photoUrl,
        bio,
        interests: interests.split(",").map(s => s.trim()),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user.uid), profileData);
      await setDoc(doc(db, "cards", user.uid), {
        cardId: user.uid,
        ...profileData,
      });
      onFinish(); // Go to HomeScreen
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Complete Your Profile</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Bio" value={bio} onChangeText={setBio} />
      <TextInput style={styles.input} placeholder="Interests (comma separated)" value={interests} onChangeText={setInterests} />
      <TextInput style={styles.input} placeholder="Photo URL" value={photoUrl} onChangeText={setPhotoUrl} />
      <TouchableOpacity style={styles.button} onPress={handleFinish} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Finish"}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#228B22", marginBottom: 24, textAlign: "center" },
  input: { height: 48, borderWidth: 1, borderColor: "#228B22", borderRadius: 12, marginBottom: 16, paddingHorizontal: 14, fontSize: 16 },
  button: { backgroundColor: "#FFD700", borderRadius: 18, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#228B22", fontWeight: "bold", fontSize: 18 },
  error: { color: "#b71c1c", backgroundColor: "#ffeeee", padding: 8, borderRadius: 8, marginBottom: 12, textAlign: "center" }
});