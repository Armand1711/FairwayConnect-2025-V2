import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "../styles/ProfileScreenStyles";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfileScreen({ user, onClose, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [newInterest, setNewInterest] = useState("");

  // Fetch profile data from Firestore
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const ref = doc(db, "cards", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setInterests(data.interests || []);
          setPhotoUrl(data.photoUrl || user.photoURL || "");
        } else {
          // If no profile, fallback to auth info
          setProfile({
            displayName: user.displayName || "",
            bio: "",
            interests: [],
            photoUrl: user.photoURL || "",
          });
          setDisplayName(user.displayName || "");
          setBio("");
          setInterests([]);
          setPhotoUrl(user.photoURL || "");
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load profile info.");
        console.log(err);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  // Save profile changes to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "cards", user.uid);
      await updateDoc(userRef, {
        displayName,
        bio,
        interests,
        photoUrl,
      });
      Alert.alert("Profile Saved", "Your profile has been updated!");
      if (onClose) onClose();
    } catch (err) {
      Alert.alert("Error", "Failed to save profile. Try again.");
      console.log(err);
    }
    setSaving(false);
  };

  // Pick new avatar image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  // Add/remove interests
  const addInterest = () => {
    if (newInterest.trim().length > 0) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };
  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✖</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarEditBtn}>
          <Image
            source={
              photoUrl
                ? { uri: photoUrl }
                : { uri: "https://ui-avatars.com/api/?name=User&background=eee&color=228B22&size=110" }
            }
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraIconText}>📸</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.interestsRow}>
          <TextInput
            style={styles.interestInput}
            value={newInterest}
            onChangeText={setNewInterest}
            placeholder="Add interest"
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
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}