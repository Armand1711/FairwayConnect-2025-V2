import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function OnboardingScreen({ user, onComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName.trim() || !bio.trim() || !interests.trim()) {
      return Alert.alert("Missing Info", "Please fill all fields");
    }

    const interestsArr = interests.split(",").map(s => s.trim()).filter(Boolean);
    if (interestsArr.length === 0) return Alert.alert("Add at least one interest");

    setLoading(true);
    try {
      const data = {
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
        setDoc(doc(db, "users", user.uid), data),
        setDoc(doc(db, "cards", user.uid), { cardId: user.uid, ...data }),
      ]);

      onComplete(); 
    } catch (e) {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 32, paddingTop: 80 }}>
          <Text style={{ fontSize: 48, fontWeight: "900", color: "#22c55e", textAlign: "center" }}>FairwayConnect</Text>
          <Text style={{ fontSize: 32, color: "#fff", textAlign: "center", marginTop: 40, fontWeight: "bold" }}>Complete Your Profile</Text>

          <TextInput style={s.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
          <TextInput style={s.input} placeholder="Handicap (optional)" value={handicap} onChangeText={setHandicap} keyboardType="decimal-pad" />
          <TextInput style={[s.input, { height: 120 }]} placeholder="Bio" value={bio} onChangeText={setBio} multiline />
          <TextInput style={s.input} placeholder="Interests (comma separated)" value={interests} onChangeText={setInterests} />

          <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Start Swiping</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = {
  input: { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, fontSize: 17, borderWidth: 1.5, borderColor: "rgba(34,197,94,0.4)" },
  btn: { backgroundColor: "#22c55e", padding: 20, borderRadius: 30, alignItems: "center", marginTop: 20 },
  btnText: { color: "#fff", fontSize: 19, fontWeight: "bold" },
};