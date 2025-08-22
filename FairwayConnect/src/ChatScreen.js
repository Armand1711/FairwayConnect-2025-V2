import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, where, updateDoc } from "firebase/firestore";
import chatStyles from "../styles/ChatScreenStyles";

export default function ChatScreen({ user, match, onClose }) {
  const [messages, setMessages] = useState([]);
  const [games, setGames] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const flatListRef = useRef(null);

  // Get the match doc id and the other user's UID
  const matchId = match.id;
  const otherUid = match.users.find(uid => uid !== user.uid);

  // Fetch messages and games, mark received messages as read
  useEffect(() => {
    const fetchMessagesGamesAndMarkRead = async () => {
      try {
        // Fetch all messages
        const messagesQuery = query(
          collection(db, "matches", matchId, "messages"),
          orderBy("timestamp")
        );
        const msgSnap = await getDocs(messagesQuery);
        const msgData = msgSnap.docs.map(doc => ({ id: doc.id, type: "message", ...doc.data() }));

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

        // Fetch all games
        const gamesQuery = query(
          collection(db, "matches", matchId, "games"),
          orderBy("timestamp")
        );
        const gameSnap = await getDocs(gamesQuery);
        const gameData = gameSnap.docs.map(doc => ({ id: doc.id, type: "game", ...doc.data() }));

        // Merge messages and games, sorted by timestamp
        const merged = [...msgData, ...gameData]
          .sort((a, b) => {
            const aTime = a.timestamp?.toDate?.() || new Date(0);
            const bTime = b.timestamp?.toDate?.() || new Date(0);
            return aTime - bTime;
          });

        setMessages(merged);
      } catch (err) {
        console.log("Error fetching or updating messages/games:", err);
        setMessages([]);
      }
    };
    fetchMessagesGamesAndMarkRead();
  }, [matchId, user.uid]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "matches", matchId, "messages"), {
        from: user.uid,
        to: otherUid,
        text: chatInput,
        timestamp: serverTimestamp(),
        read: false
      });
      setChatInput("");
      // Re-fetch merged messages & games
      // (Reuse effect by updating dependency: not optimal, but simple for demo)
      setMessages([]);
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  // Organizer: form to set up a golf game
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
      // Re-fetch merged messages & games
      setMessages([]);
      alert("Golf game organized!");
    } catch (err) {
      console.log("Error organizing game:", err);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === "message") {
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
    } else if (item.type === "game") {
      return (
        <View style={chatStyles.gameCard}>
          <Text style={chatStyles.gameCardTitle}>⛳ Golf Game Organized!</Text>
          <Text style={chatStyles.gameCardDetail}>Date: <Text style={chatStyles.gameCardValue}>{item.date}</Text></Text>
          <Text style={chatStyles.gameCardDetail}>Time: <Text style={chatStyles.gameCardValue}>{item.time}</Text></Text>
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
        keyExtractor={item => item.id + item.type}
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