import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthAndOnboardingScreen({ onAuth, onProfile }) {
  const [step, setStep] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      onAuth(userCredential.user); // triggers onboarding in App.js
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check if user has a profile:
      const profileDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (profileDoc.exists()) {
        onAuth(userCredential.user); // go to HomeScreen
      } else {
        onProfile(userCredential.user); // go to onboarding
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>{step === "signup" ? "Sign Up" : "Log In"}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity
        style={styles.button}
        onPress={step === "signup" ? handleSignup : handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Please wait..." : step === "signup" ? "Sign Up" : "Log In"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep(step === "signup" ? "login" : "signup")}>
        <Text style={styles.switchText}>
          {step === "signup" ? "Already have an account? Log In" : "Need an account? Sign Up"}
        </Text>
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
  switchText: { color: "#228B22", textAlign: "center", marginTop: 18, fontSize: 16 },
  error: { color: "#b71c1c", backgroundColor: "#ffeeee", padding: 8, borderRadius: 8, marginBottom: 12, textAlign: "center" }
});