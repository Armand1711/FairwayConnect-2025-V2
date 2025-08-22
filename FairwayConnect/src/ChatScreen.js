import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, where, updateDoc } from "firebase/firestore";
import chatStyles from "../styles/ChatScreenStyles";

// Input formatting helpers
function formatDateInput(v) {
  v = v.replace(/[^\d]/g, "").slice(0, 8);
  if (v.length >= 5) v = v.slice(0, 4) + "-" + v.slice(4);
  if (v.length >= 8) v = v.slice(0, 7) + "-" + v.slice(7);
  return v;
}
function formatTimeInput(v) {
  v = v.replace(/[^\d]/g, "").slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + ":" + v.slice(2);
  return v;
}
function unformatDateInput(v) {
  return v.replace(/-/g, "");
}
function unformatTimeInput(v) {
}

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
        // Fetch all messages
        const messagesQuery = query(
          collection(db, "matches", matchId, "messages"),
          orderBy("timestamp")
        );
        const msgSnap = await getDocs(messagesQuery);
        const msgData = msgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

        setMessages(msgData);
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
        type: "text",
        timestamp: serverTimestamp(),
        read: false
      });
      setChatInput("");
      setMessages([]); // Trigger re-fetch
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  // Organizer: form to set up a golf game (date/time as formatted)
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameDetails, setGameDetails] = useState({ date: "", time: "", location: "" });
  const organizeGame = async () => {
    // Validate that date and time are numbers (unformatted)
    const rawDate = unformatDateInput(gameDetails.date);
    const rawTime = unformatTimeInput(gameDetails.time);
    if (!rawDate || isNaN(Number(rawDate)) || rawDate.length !== 8 ||
        !rawTime || isNaN(Number(rawTime)) || rawTime.length !== 4 ||
        !gameDetails.location.trim()) {
      alert("Please enter a valid date (YYYY-MM-DD), time (HH:MM), and location.");
      return;
    }
    try {
      // Add as a message in the chat, with type "game"
      await addDoc(collection(db, "matches", matchId, "messages"), {
        from: user.uid,
        to: otherUid,
        type: "game",
        date: rawDate,
        time: rawTime,
        location: gameDetails.location,
        organizedBy: user.uid,
        timestamp: serverTimestamp(),
        read: false
      });
      setShowGameForm(false);
      setGameDetails({ date: "", time: "", location: "" });
      setMessages([]); // Trigger re-fetch
      alert("Golf game organized!");
    } catch (err) {
      console.log("Error organizing game:", err);
    }
  };

  const renderItem = ({ item }) => {
    // Standard message
    if (!item.type || item.type === "text") {
      return (
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
            {/* Read Receipt */}
            {item.from === user.uid && item.read ? (
              <Text style={{ color: "#228B22", fontSize: 12, marginTop: 2 }}>✔ Read</Text>
            ) : null}
          </View>
        </View>
      );
    }
    // Golf game card as a chat message
    if (item.type === "game") {
      // formatted date: YYYY-MM-DD; formatted time: HH:MM
      const formattedDate = item.date && item.date.length === 8
        ? `${item.date.slice(0,4)}-${item.date.slice(4,6)}-${item.date.slice(6,8)}`
        : item.date;
      const formattedTime = item.time && item.time.length === 4
        ? `${item.time.slice(0,2)}:${item.time.slice(2,4)}`
        : item.time;
      return (
        <View style={chatStyles.gameCard}>
          <Text style={chatStyles.gameCardTitle}>⛳ Golf Game Booked!</Text>
          <Text style={chatStyles.gameCardDetail}>Date: <Text style={chatStyles.gameCardValue}>{formattedDate}</Text></Text>
          <Text style={chatStyles.gameCardDetail}>Time: <Text style={chatStyles.gameCardValue}>{formattedTime}</Text></Text>
          <Text style={chatStyles.gameCardDetail}>Location: <Text style={chatStyles.gameCardValue}>{item.location}</Text></Text>
          <Text style={chatStyles.gameCardOrganizer}>
            Organizer: {item.organizedBy === user.uid ? "You" : "Them"}
          </Text>
        </View>
      );
    }
    return null;
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
        keyExtractor={item => item.id + (item.type || "text")}
        renderItem={renderItem}
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
        <Text style={chatStyles.gameBtnText}>📅 Book Golf Game</Text>
      </TouchableOpacity>

      {/* Golf game booking modal */}
      <Modal visible={showGameForm} transparent animationType="fade">
        <View style={chatStyles.gameFormOverlay}>
          <View style={chatStyles.gameForm}>
            <Text style={chatStyles.gameFormTitle}>Book a Golf Game</Text>
            <TextInput
              style={chatStyles.gameInput}
              placeholder="Date (YYYY-MM-DD)"
              value={gameDetails.date}
              keyboardType="numeric"
              onChangeText={v => setGameDetails(d => ({
                ...d,
                date: formatDateInput(v)
              }))}
              placeholderTextColor="#444"
              maxLength={10}
            />
            <TextInput
              style={chatStyles.gameInput}
              placeholder="Time (HH:MM)"
              value={gameDetails.time}
              keyboardType="numeric"
              onChangeText={v => setGameDetails(d => ({
                ...d,
                time: formatTimeInput(v)
              }))}
              placeholderTextColor="#444"
              maxLength={5}
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
                <Text style={chatStyles.organizeText}>Book</Text>
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