import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from "react-native";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import ChatScreen from "./ChatScreen";

export default function MatchesScreen({ user, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

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
      } catch (err) {
        console.log("Error fetching matches:", err);
        setMatches([]);
      }
      setLoading(false);
    };
    fetchMatches();
  }, [user]);

  const renderItem = ({ item }) => {
    // Get the other user's UID
    const otherUid = item.users.find(uid => uid !== user.uid);
    return (
      <TouchableOpacity style={styles.matchItem} onPress={() => setSelectedMatch(item)}>
        <Text style={styles.matchText}>Matched with: {otherUid}</Text>
        <Text style={styles.matchDate}>Matched at: {item.createdAt?.toDate().toLocaleString() || "Unknown"}</Text>
        <Text style={styles.matchDesc}>Tap to chat or organize a golf game!</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✖ Close</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
      ) : matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 40 }}>No matches yet.</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "#f0f0f0" },
  title: { fontSize: 24, fontWeight: "bold", color: "#228B22" },
  closeBtn: { backgroundColor: "#FFD700", borderRadius: 22, padding: 10 },
  closeText: { color: "#228B22", fontWeight: "bold", fontSize: 16 },
  matchItem: { backgroundColor: "#e6ffe6", borderRadius: 14, padding: 18, marginVertical: 8, marginHorizontal: 16, elevation: 2 },
  matchText: { fontSize: 18, fontWeight: "bold", color: "#228B22" },
  matchDate: { fontSize: 13, color: "#888", marginTop: 4 },
  matchDesc: { fontSize: 14, color: "#555", marginTop: 6 }
});