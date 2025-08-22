import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function AuthScreen({ onAuth }) {
  const [step, setStep] = useState("login"); // "login" or "signup"
  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Onboarding fields (used on signup)
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoLocal, setPhotoLocal] = useState(null);
  //
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email format validation
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Handle picking an image from the phone
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoLocal(result.assets[0].uri);
      setPhotoUrl(result.assets[0].uri); // Store local URI for now (can upload to storage later)
    }
  };

  // Add/remove interest
  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed.length > 0 && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterest("");
    }
  };
  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  // Merged Signup+Onboarding
  const handleSignup = async () => {
    setError("");
    if (
      !email.trim() ||
      !password.trim() ||
      !displayName.trim() ||
      !bio.trim() ||
      interests.length === 0
    ) {
      setError("Please fill out all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const userObj = userCredential.user;
      // Save profile info
      const profileData = {
        uid: userObj.uid,
        displayName: displayName.trim(),
        email: userObj.email,
        photoUrl: photoUrl.trim(),
        bio: bio.trim(),
        interests: interests,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userObj.uid), profileData);
      await setDoc(doc(db, "cards", userObj.uid), { cardId: userObj.uid, ...profileData });
      onAuth(userObj);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Basic Login
  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuth(userCredential.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.logo}>⛳️</Text>
          <Text style={styles.title}>
            {step === "signup" ? "Sign Up / Onboarding" : "Log In"}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#444"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#444"
          />
          {step === "signup" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                placeholderTextColor="#444"
              />
              <TextInput
                style={styles.input}
                placeholder="Bio"
                value={bio}
                onChangeText={setBio}
                autoCapitalize="sentences"
                placeholderTextColor="#444"
              />

              {/* Interests UI (same as profile) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Interests</Text>
                <View style={styles.interestsRow}>
                  <TextInput
                    style={styles.interestInput}
                    value={newInterest}
                    onChangeText={setNewInterest}
                    placeholder="Add interest"
                    placeholderTextColor="#444"
                    onSubmitEditing={addInterest}
                  />
                  <TouchableOpacity style={styles.addInterestBtn} onPress={addInterest}>
                    <Text style={styles.addInterestBtnText}>＋</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.interestChips}>
                  {interests.map((interest, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{interest}</Text>
                      <TouchableOpacity onPress={() => removeInterest(i)}>
                        <Text style={styles.chipRemove}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.photoPickBtn} onPress={pickImage}>
                <Text style={styles.photoPickText}>
                  {photoLocal ? "Change Profile Photo" : "Pick Profile Photo"}
                </Text>
              </TouchableOpacity>
              {photoLocal && (
                <Image
                  source={{ uri: photoLocal }}
                  style={styles.profilePhoto}
                />
              )}
            </>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={step === "signup" ? handleSignup : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {step === "signup" ? "Sign Up" : "Log In"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(step === "signup" ? "login" : "signup")}>
            <Text style={styles.switchText}>
              {step === "signup"
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 28,
    shadowColor: "#228B22",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
  },
  logo: {
    fontSize: 54,
    marginBottom: 14,
    color: "#228B22",
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 6,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#f6f6f6",
    borderRadius: 14,
    padding: 15,
    fontSize: 17,
    color: "#222", // DARKER TEXT COLOR
    borderWidth: 1,
    borderColor: "#90ee90",
    marginBottom: 15,
    shadowColor: "#ddd",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: "#228B22",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    elevation: 3,
    shadowColor: "#228B22",
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 1.1,
  },
  switchText: {
    color: "#228B22",
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  error: {
    color: "#b71c1c",
    backgroundColor: "#ffeeee",
    padding: 9,
    borderRadius: 10,
    marginBottom: 13,
    textAlign: "center",
    width: "100%",
  },
  photoPickBtn: {
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  photoPickText: {
    fontWeight: "bold",
    color: "#228B22",
    fontSize: 15,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: "#228B22",
    backgroundColor: "#eee",
  },
  // Interests styling (same as profile edit)
  formGroup: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    fontWeight: "bold",
    color: "#228B22",
    fontSize: 16,
    marginBottom: 7,
    marginLeft: 3,
  },
  interestsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  interestInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: "#FFD700",
    marginRight: 8,
  },
  addInterestBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 16,
    padding: 9,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#FFD700",
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  addInterestBtnText: {
    color: "#228B22",
    fontWeight: "bold",
    fontSize: 22,
  },
  interestChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 7,
  },
  chip: {
    flexDirection: "row",
    backgroundColor: "#90ee90",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    margin: 4,
    elevation: 2,
    shadowColor: "#228B22",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  chipText: {
    color: "#228B22",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 7,
  },
  chipRemove: {
    color: "#ff3333",
    fontWeight: "bold",
    fontSize: 18,
  },
});