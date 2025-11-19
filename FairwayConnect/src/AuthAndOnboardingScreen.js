import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import styles from "../styles/AuthGateStyles";

export default function AuthAndOnboardingScreen({ onAuth, onProfile }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignup = async () => {
    if (!email || !password) return Alert.alert("Fill in both fields");
    if (!validateEmail(email)) return Alert.alert("Invalid email");
    if (password.length < 6) return Alert.alert("Password must be 6+ characters");

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onProfile(cred.user); // Go to full onboarding
    } catch (err) {
      Alert.alert("Sign Up Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Enter email and password");
    if (!validateEmail(email)) return Alert.alert("Invalid email");

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profileSnap = await getDoc(doc(db, "users", cred.user.uid));

      if (profileSnap.exists()) {
        onAuth(cred.user); // Profile exists → Home
      } else {
        onProfile(cred.user); // No profile → Onboarding
      }
    } catch (err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Logo */}
          <Text style={styles.logo}>TeeMatch</Text>
          <Text style={styles.tagline}>Where golfers find their perfect match</Text>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>
              {isSignup ? "Join the Club" : "Welcome Back"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.authBtn, loading && styles.disabled]}
              onPress={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.authBtnText}>
                    {isSignup ? "Create Account" : "Log In"}
                  </Text>
                  <Ionicons name="arrow-forward" size={24} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
              <Text style={styles.switchText}>
                {isSignup
                  ? "Already have an account? Log In"
                  : "New to TeeMatch? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            The fairest way to find your next golf partner
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}