import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Image, ActivityIndicator } from "react-native";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import ChatScreen from "./ChatScreen";
import chatStyles from "../styles/ChatAndMatchesStyles";

export default function MatchesScreen({ user, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [players, setPlayers] = useState({}); // stores other users profiles

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const matchesQuery = query(
          collection(db, "matches"),
          where("users", "array-contains", user.uid)
        );
        const snap = await getDocs(matchesQuery);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMatches(data);

        // Fetch other users profiles for display (handicap, avatar, etc)
        let usersToFetch = [];
        data.forEach(match => {
          const otherUid = match.users.find(uid => uid !== user.uid);
          if (otherUid && !players[otherUid]) usersToFetch.push(otherUid);
        });
        let newPlayers = {};
        await Promise.all(usersToFetch.map(async uid => {
          try {
            const docSnap = await getDoc(doc(db, "cards", uid));
            if (docSnap.exists()) newPlayers[uid] = docSnap.data();
          } catch (e) {}
        }));
        setPlayers(prev => ({ ...prev, ...newPlayers }));
      } catch (err) {
        console.log("Error fetching matches:", err);
        setMatches([]);
      }
      setLoading(false);
    };
    fetchMatches();
    
  }, [user]);

  const renderItem = ({ item }) => {
    // Get the other users UID and profile
    const otherUid = item.users.find(uid => uid !== user.uid);
    const p = players[otherUid] || {};

    return (
      <TouchableOpacity style={chatStyles.matchCard} onPress={() => setSelectedMatch(item)}>
        <Image
          source={
            p.photoUrl
              ? { uri: p.photoUrl }
              : { uri: "https://ui-avatars.com/api/?name=User&background=eee&color=228B22&size=54" }
          }
          style={chatStyles.matchAvatar}
        />
        <View style={chatStyles.matchInfo}>
          <Text style={chatStyles.matchName}>{p.displayName || otherUid}</Text>
          {p.handicap !== undefined && p.handicap !== "" && (
            <Text style={chatStyles.matchHandicap}>Handicap: {p.handicap}</Text>
          )}
          {p.bio ? <Text style={chatStyles.matchBio}>{p.bio}</Text> : null}
          <Text style={chatStyles.matchDate}>
            Matched at: {item.createdAt?.toDate?.() ? item.createdAt.toDate().toLocaleString() : "Unknown"}
          </Text>
        </View>
        <TouchableOpacity style={chatStyles.chatBtn} onPress={() => setSelectedMatch(item)}>
          <Text style={chatStyles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={chatStyles.container}>
      <View style={chatStyles.header}>
        <Text style={chatStyles.headerTitle}>Your Matches</Text>
        <TouchableOpacity style={chatStyles.closeBtn} onPress={onClose}>
          <Text style={chatStyles.closeBtnText}>✖</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#228B22" style={{ marginTop: 30 }} />
      ) : matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={chatStyles.matchesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 40, color: "#888", fontSize: 16 }}>No matches yet.</Text>
      )}

      {/* Chat Modal */}
      <Modal visible={!!selectedMatch} animationType="slide">
        {selectedMatch && (
          <ChatScreen
            user={user}
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </Modal>
    </View>
  );
}