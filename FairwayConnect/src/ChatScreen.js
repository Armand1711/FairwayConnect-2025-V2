import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";
import styles from "../styles/ChatScreenStyles";

// Format helpers
const formatDateInput = (v) => v.replace(/[^\d]/g, "").slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3").slice(0, 10);
const formatTimeInput = (v) => v.replace(/[^\d]/g, "").slice(0, 4).replace(/(\d{2})(\d{2})/, "$1:$2").slice(0, 5);

export default function ChatScreen({ user, match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameDetails, setGameDetails] = useState({ date: "", time: "", location: "" });
  const flatListRef = useRef(null);

  const matchId = match.id;
  const otherUid = match.users.find(uid => uid !== user.uid);

  useEffect(() => {
    fetchAndMarkRead();
  }, [matchId, user.uid]);

  const fetchAndMarkRead = async () => {
    try {
      // Mark unread
      const unreadQ = query(
        collection(db, "matches", matchId, "messages"),
        where("to", "==", user.uid),
        where("read", "==", false)
      );
      const unreadSnap = await getDocs(unreadQ);
      await Promise.all(unreadSnap.docs.map(d => updateDoc(d.ref, { read: true })));

      // Fetch all
      const q = query(collection(db, "matches", matchId, "messages"), orderBy("timestamp"));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    await addDoc(collection(db, "matches", matchId, "messages"), {
      from: user.uid,
      to: otherUid,
      text: chatInput.trim(),
      type: "text",
      timestamp: serverTimestamp(),
      read: false,
    });
    setChatInput("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const organizeGame = async () => {
    const rawDate = gameDetails.date.replace(/-/g, "");
    const rawTime = gameDetails.time.replace(/:/g, "");
    if (rawDate.length !== 8 || rawTime.length !== 4 || !gameDetails.location.trim()) {
      alert("Fill all fields correctly!");
      return;
    }
    await addDoc(collection(db, "matches", matchId, "messages"), {
      from: user.uid,
      to: otherUid,
      type: "game",
      date: rawDate,
      time: rawTime,
      location: gameDetails.location,
      organizedBy: user.uid,
      timestamp: serverTimestamp(),
      read: false,
    });
    setShowGameForm(false);
    setGameDetails({ date: "", time: "", location: "" });
  };

  const renderMessage = ({ item }) => {
    const isMine = item.from === user.uid;

    if (item.type === "game") {
      const date = `${item.date.slice(0,4)}-${item.date.slice(4,6)}-${item.date.slice(6)}`;
      const time = `${item.time.slice(0,2)}:${item.time.slice(2)}`;
      return (
        <View style={styles.gameCard}>
          <Ionicons name="golf" size={32} color="#22c55e" />
          <Text style={styles.gameTitle}>Golf Round Locked In</Text>
          <Text style={styles.gameDetail}>Date: <Text style={styles.gameValue}>{date}</Text></Text>
          <Text style={styles.gameDetail}>Time: <Text style={styles.gameValue}>{time}</Text></Text>
          <Text style={styles.gameDetail}>Course: <Text style={styles.gameValue}>{item.location}</Text></Text>
          <Text style={styles.gameOrganizer}>
            Organized by {item.organizedBy === user.uid ? "You" : "Your Match"}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.bubbleRow, isMine && styles.bubbleRowRight]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
            {item.text}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={styles.bubbleTime}>
              {item.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && item.read && <Ionicons name="checkmark-done" size={16} color="#22c55e" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#64748b"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Book Game Button */}
        <TouchableOpacity style={styles.bookGameBtn} onPress={() => setShowGameForm(true)}>
          <Ionicons name="golf-outline" size={26} color="#fff" />
          <Text style={styles.bookGameText}>Book Tee Time</Text>
        </TouchableOpacity>

        {/* Game Modal */}
        <Modal visible={showGameForm} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Book a Round</Text>
              <TextInput style={styles.modalInput} placeholder="Date (YYYY-MM-DD)" value={gameDetails.date} onChangeText={t => setGameDetails(d => ({ ...d, date: formatDateInput(t) }))} keyboardType="numeric" maxLength={10} />
              <TextInput style={styles.modalInput} placeholder="Time (HH:MM)" value={gameDetails.time} onChangeText={t => setGameDetails(d => ({ ...d, time: formatDateInput(t).slice(11) || formatTimeInput(t) }))} keyboardType="numeric" maxLength={5} />
              <TextInput style={styles.modalInput} placeholder="Course / Location" value={gameDetails.location} onChangeText={t => setGameDetails(d => ({ ...d, location: t }))} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowGameForm(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={organizeGame}>
                  <Text style={styles.modalConfirmText}>Confirm Tee Time</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}