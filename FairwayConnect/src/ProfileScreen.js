import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function ProfileScreen({ user, onClose, onLogout }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load profile info
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const profileDoc = await getDoc(docRef);
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setInterests(data.interests ? data.interests.join(", ") : "");
        setPhotoUrl(data.photoUrl || "");
      }
    }
    fetchProfile();
  }, [user]);

  // Save changes
  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const updatedProfile = {
        uid: user.uid,
        displayName,
        email: user.email,
        photoUrl,
        bio,
        interests: interests.split(",").map(s => s.trim()),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user.uid), updatedProfile);
      await setDoc(doc(db, "cards", user.uid), { cardId: user.uid, ...updatedProfile });
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Edit Profile</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Email: {user.email}</Text>
      <TextInput style={styles.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Bio" value={bio} onChangeText={setBio} />
      <TextInput style={styles.input} placeholder="Interests (comma separated)" value={interests} onChangeText={setInterests} />
      <TextInput style={styles.input} placeholder="Photo URL" value={photoUrl} onChangeText={setPhotoUrl} />
      {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.photo} /> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#228B22", marginBottom: 22, textAlign: "center" },
  label: { fontSize: 16, color: "#555", marginBottom: 8 },
  input: { height: 42, borderWidth: 1, borderColor: "#228B22", borderRadius: 12, marginBottom: 14, paddingHorizontal: 12, fontSize: 16 },
  photo: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, alignSelf: "center" },
  button: { backgroundColor: "#FFD700", borderRadius: 18, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#228B22", fontWeight: "bold", fontSize: 18 },
  logoutBtn: { backgroundColor: "#eee", borderRadius: 18, paddingVertical: 12, alignItems: "center", marginTop: 14 },
  logoutText: { color: "#d32f2f", fontWeight: "bold", fontSize: 16 },
  closeBtn: { alignItems: "center", marginTop: 10 },
  closeText: { color: "#228B22", fontSize: 16 },
  error: { color: "#b71c1c", backgroundColor: "#ffeeee", padding: 8, borderRadius: 8, marginBottom: 12, textAlign: "center" }
});