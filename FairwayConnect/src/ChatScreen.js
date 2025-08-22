import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, where, updateDoc } from "firebase/firestore";
import chatStyles from "../styles/ChatScreenStyles";

export default function ChatScreen({ user, match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const flatListRef = useRef(null);

  // Get the match doc id and the other user's UID
  const matchId = match.id;
  const otherUid = match.users.find(uid => uid !== user.uid);

  // Fetch messages and mark received messages as read
  useEffect(() => {
    const fetchMessagesAndMarkRead = async () => {
      try {
        // Fetch all messages in this match
        const messagesQuery = query(
          collection(db, "matches", matchId, "messages"),
          orderBy("timestamp")
        );
        const snap = await getDocs(messagesQuery);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(data);

        // Mark all messages sent TO the current user (and not yet read) as read
        const unreadQuery = query(
          collection(db, "matches", matchId, "messages"),
          where("to", "==", user.uid),
          where("read", "==", false)
        );
        const unreadSnap = await getDocs(unreadQuery);
        await Promise.all(unreadSnap.docs.map(docSnap =>
          updateDoc(docSnap.ref, { read: true })
        ));
      } catch (err) {
        console.log("Error fetching or updating messages:", err);
        setMessages([]);
      }
    };
    fetchMessagesAndMarkRead();
  }, [matchId, user.uid]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "matches", matchId, "messages"), {
        from: user.uid,
        to: otherUid,
        text: chatInput,
        timestamp: serverTimestamp(),
        read: false // NEW: read receipt
      });
      setChatInput("");
      // Re-fetch messages to update UI
      const messagesQuery = query(
        collection(db, "matches", matchId, "messages"),
        orderBy("timestamp")
      );
      const snap = await getDocs(messagesQuery);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
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
    <KeyboardAvoidingView style={chatStyles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={chatStyles.header}>
        <Text style={chatStyles.headerTitle}>Chat with {otherUid}</Text>
        <TouchableOpacity style={chatStyles.closeBtn} onPress={onClose}>
          <Text style={chatStyles.closeBtnText}>✖</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            chatStyles.chatBubbleRow,
            { justifyContent: item.from === user.uid ? "flex-end" : "flex-start" }
          ]}>
            <View style={[
              chatStyles.chatBubble,
              item.from === user.uid && chatStyles.chatBubbleSelf
            ]}>
              <Text style={[
                chatStyles.chatBubbleText,
                item.from === user.uid && chatStyles.chatBubbleTextSelf
              ]}>
                {item.text}
              </Text>
              <Text style={chatStyles.chatMeta}>
                {item.from === user.uid ? "You" : "Them"}
                {" • "}
                {item.timestamp?.toDate().toLocaleTimeString() || ""}
              </Text>
              {/* Read Receipt: Only show for YOUR messages */}
              {item.from === user.uid && item.read ? (
                <Text style={{ color: "#228B22", fontSize: 12, marginTop: 2 }}>✔ Read</Text>
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={chatStyles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={chatStyles.chatInputRow}>
        <TextInput
          style={chatStyles.chatInput}
          placeholder="Type a message..."
          value={chatInput}
          onChangeText={setChatInput}
          placeholderTextColor="#444"
        />
        <TouchableOpacity style={chatStyles.sendBtn} onPress={sendMessage}>
          <Text style={chatStyles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={chatStyles.gameBtn} onPress={() => setShowGameForm(true)}>
        <Text style={chatStyles.gameBtnText}>📅 Organize Golf Game</Text>
      </TouchableOpacity>

      {/* Golf game organizer modal */}
      <Modal visible={showGameForm} transparent animationType="fade">
        <View style={chatStyles.gameFormOverlay}>
          <View style={chatStyles.gameForm}>
            <Text style={chatStyles.gameFormTitle}>Organize a Golf Game</Text>
            <TextInput
              style={chatStyles.gameInput}
              placeholder="Date (e.g. 2025-09-01)"
              value={gameDetails.date}
              onChangeText={v => setGameDetails(d => ({ ...d, date: v }))}
              placeholderTextColor="#444"
            />
            <TextInput
              style={chatStyles.gameInput}
              placeholder="Time (e.g. 10:00 AM)"
              value={gameDetails.time}
              onChangeText={v => setGameDetails(d => ({ ...d, time: v }))}
              placeholderTextColor="#444"
            />
            <TextInput
              style={chatStyles.gameInput}
              placeholder="Location"
              value={gameDetails.location}
              onChangeText={v => setGameDetails(d => ({ ...d, location: v }))}
              placeholderTextColor="#444"
            />
            <View style={chatStyles.gameFormBtnRow}>
              <TouchableOpacity style={chatStyles.organizeBtn} onPress={organizeGame}>
                <Text style={chatStyles.organizeText}>Organize</Text>
              </TouchableOpacity>
              <TouchableOpacity style={chatStyles.cancelBtn} onPress={() => setShowGameForm(false)}>
                <Text style={chatStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}