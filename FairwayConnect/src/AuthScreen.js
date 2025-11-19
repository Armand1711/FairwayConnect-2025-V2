import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function AuthScreen({ onAuth, onProfile }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Missing", "Enter email and password");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      snap.exists() ? onAuth(cred.user) : onProfile(cred.user);
    } catch (e) {
      Alert.alert("Login Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) return Alert.alert("Missing", "Fill in email and password");
    if (password.length < 6) return Alert.alert("Weak password", "Use 6+ characters");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onProfile(cred.user);
    } catch (e) {
      Alert.alert("Sign Up Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ fontSize: 56, fontWeight: "900", color: "#22c55e" }}>FairwayConnect</Text>
          <Text style={{ color: "#94a3b8", marginTop: 12, fontSize: 18 }}>Where golfers find their perfect match</Text>

          <View style={{ backgroundColor: "rgba(30,41,59,0.95)", width: "100%", padding: 40, borderRadius: 32, marginTop: 60 }}>
            <Text style={{ fontSize: 34, color: "#fff", textAlign: "center", fontWeight: "bold", marginBottom: 30 }}>
              {isSignup ? "Join the Club" : "Welcome Back"}
            </Text>

            <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={s.btn} onPress={isSignup ? handleSignup : handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{isSignup ? "Create Account" : "Log In"}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
              <Text style={{ color: "#22c55e", textAlign: "center", marginTop: 24, fontWeight: "600" }}>
                {isSignup ? "Already a member? Log In" : "New here? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = {
  input: { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, fontSize: 17, borderWidth: 1.5, borderColor: "rgba(34,197,94,0.4)" },
  btn: { backgroundColor: "#22c55e", padding: 20, borderRadius: 30, alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontSize: 19, fontWeight: "bold" },
};