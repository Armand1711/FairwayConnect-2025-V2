import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen({ user, onSignOut }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      setProfile(snap.exists() ? snap.data() : null);
    }
    fetchProfile();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.email}!</Text>
      <Text style={styles.detail}>UID: {user.uid}</Text>
      {profile && (
        <>
          <Text style={styles.detail}>Profile Created: {profile.createdAt}</Text>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={async () => { await signOut(auth); onSignOut(); }}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 18, color: "#228B22" },
  detail: { fontSize: 16, marginBottom: 7, color: "#555" },
  button: { backgroundColor: "#FFD700", padding: 14, borderRadius: 14, marginTop: 24 },
  buttonText: { color: "#228B22", fontWeight: "bold", fontSize: 18 }
});