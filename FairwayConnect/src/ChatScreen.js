import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, where, getDocs, serverTimestamp } from "firebase/firestore";

export default function ChatScreen({ user, match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const flatListRef = useRef(null);

  // Get the match doc id and the other user's UID
  const matchId = match.id;
  const otherUid = match.users.find(uid => uid !== user.uid);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesQuery = query(
          collection(db, "matches", matchId, "messages"),
          orderBy("timestamp")
        );
        const snap = await getDocs(messagesQuery);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(data);
      } catch (err) {
        console.log("Error fetching messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [matchId]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "matches", matchId, "messages"), {
        from: user.uid,
        to: otherUid,
        text: chatInput,
        timestamp: serverTimestamp()
      });
      setChatInput("");
      // Optionally, re-fetch messages or use realtime listeners
      // For now, simple fetch again
      const messagesQuery = query(
        collection(db, "matches", matchId, "messages"),
        orderBy("timestamp")
      );
      const snap = await getDocs(messagesQuery);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
      // Scroll to bottom
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  // Organizer: form to set up a golf game (basic demo)
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameDetails, setGameDetails] = useState({ date: "", time: "", location: "" });
  const organizeGame = async () => {
    try {
      // Save game details in the match doc
      // You may want to validate the form!
      await addDoc(collection(db, "matches", matchId, "games"), {
        ...gameDetails,
        organizedBy: user.uid,
        timestamp: serverTimestamp()
      });
      setShowGameForm(false);
      setGameDetails({ date: "", time: "", location: "" });
      alert("Golf game organized!");
    } catch (err) {
      console.log("Error organizing game:", err);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat with {otherUid}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✖ Close</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msgBubble, item.from === user.uid ? styles.myMsg : styles.theirMsg]}>
            <Text style={styles.msgText}>{item.text}</Text>
            <Text style={styles.msgMeta}>{item.from === user.uid ? "You" : "Them"} - {item.timestamp?.toDate().toLocaleTimeString() || ""}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.gameBtn} onPress={() => setShowGameForm(true)}>
        <Text style={styles.gameBtnText}>📅 Organize Golf Game</Text>
      </TouchableOpacity>

      {/* Simple game organizer modal */}
      {showGameForm && (
        <View style={styles.gameForm}>
          <Text style={styles.gameFormTitle}>Organize a Golf Game</Text>
          <TextInput
            style={styles.gameInput}
            placeholder="Date (e.g. 2025-09-01)"
            value={gameDetails.date}
            onChangeText={v => setGameDetails(d => ({ ...d, date: v }))}
          />
          <TextInput
            style={styles.gameInput}
            placeholder="Time (e.g. 10:00 AM)"
            value={gameDetails.time}
            onChangeText={v => setGameDetails(d => ({ ...d, time: v }))}
          />
          <TextInput
            style={styles.gameInput}
            placeholder="Location"
            value={gameDetails.location}
            onChangeText={v => setGameDetails(d => ({ ...d, location: v }))}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity style={styles.organizeBtn} onPress={organizeGame}>
              <Text style={styles.organizeText}>Organize</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGameForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "#f0f0f0" },
  title: { fontSize: 22, fontWeight: "bold", color: "#228B22" },
  closeBtn: { backgroundColor: "#FFD700", borderRadius: 22, padding: 10 },
  closeText: { color: "#228B22", fontWeight: "bold", fontSize: 16 },
  msgBubble: { borderRadius: 16, padding: 10, marginVertical: 6, maxWidth: "80%" },
  myMsg: { alignSelf: "flex-end", backgroundColor: "#d0ffd6" },
  theirMsg: { alignSelf: "flex-start", backgroundColor: "#e6e6e6" },
  msgText: { fontSize: 16, color: "#333" },
  msgMeta: { fontSize: 11, color: "#999", marginTop: 2 },
  inputRow: { flexDirection: "row", padding: 10, backgroundColor: "#f8f8f8" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 16, padding: 10, marginRight: 10 },
  sendBtn: { backgroundColor: "#228B22", borderRadius: 16, padding: 10, justifyContent: "center", alignItems: "center" },
  sendText: { color: "#fff", fontWeight: "bold" },
  gameBtn: { backgroundColor: "#FFD700", borderRadius: 22, padding: 14, margin: 14, alignItems: "center" },
  gameBtnText: { color: "#228B22", fontWeight: "bold", fontSize: 16 },
  gameForm: { backgroundColor: "#fff", borderRadius: 18, padding: 16, margin: 18, elevation: 4 },
  gameFormTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#228B22" },
  gameInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 8, marginBottom: 10 },
  organizeBtn: { backgroundColor: "#228B22", borderRadius: 14, padding: 10, marginRight: 10 },
  organizeText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#FFD700", borderRadius: 14, padding: 10 },
  cancelText: { color: "#228B22", fontWeight: "bold" }
});