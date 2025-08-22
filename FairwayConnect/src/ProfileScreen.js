import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "../styles/ProfileScreenStyles";

export default function ProfileScreen({ user, onClose, onLogout }) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [interests, setInterests] = useState(user.interests || []);
  const [photoUrl, setPhotoUrl] = useState(user.photoURL || "");
  const [newInterest, setNewInterest] = useState("");


  const handleSave = () => { 
    Alert.alert("Profile Saved", "Your profile has been updated!");
    onClose && onClose();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.cancelled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const addInterest = () => {
    if (newInterest.trim().length > 0) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✖</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarEditBtn}>
          <Image
            source={photoUrl ? { uri: photoUrl } : require("../assets/avatar-placeholder.png")}
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
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}