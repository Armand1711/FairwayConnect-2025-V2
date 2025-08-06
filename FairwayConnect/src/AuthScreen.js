import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      onAuth(userCred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSignup = async () => {
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Create a profile in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: userCred.user.email,
        createdAt: new Date().toISOString(),
      });
      onAuth(userCred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>{isSignup ? "Sign Up" : "Login"}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={isSignup ? handleSignup : handleLogin}>
        <Text style={styles.buttonText}>{isSignup ? "Sign Up" : "Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.link}>{isSignup ? "Already have an account? Log In" : "No account? Sign Up"}</Text>
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
  link: { color: "#228B22", marginTop: 14, textAlign: "center" },
  error: { color: "red", marginBottom: 12, textAlign: "center" }
});