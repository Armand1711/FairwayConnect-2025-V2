import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import ChatScreen from "./ChatScreen";
import styles from "../styles/ChatAndMatchesStyles";

export default function MatchesScreen({ user, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "matches"), where("users", "array-contains", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch other user's profile
      const fetchPromises = data.map(async (match) => {
        const otherUid = match.users.find((uid) => uid !== user.uid);
        if (!otherUid || players[otherUid]) return;
        const docSnap = await getDoc(doc(db, "cards", otherUid));
        if (docSnap.exists()) {
          setPlayers((prev) => ({ ...prev, [otherUid]: docSnap.data() }));
        }
      });
      await Promise.all(fetchPromises);

      setMatches(data);
    } catch (err) {
      console.log("Error fetching matches:", err);
    }
    setLoading(false);
  };

  const openChat = (match) => setSelectedMatch(match);

  const renderMatch = ({ item }) => {
    const otherUid = item.users.find((uid) => uid !== user.uid);
    const profile = players[otherUid] || {};

    return (
      <TouchableOpacity style={styles.matchCard} onPress={() => openChat(item)}>
        <Image
          source={{
            uri:
              profile.photoUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || "G")}&background=1e293b&color=22c55e&size=120&bold=true`,
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{profile.displayName || "Golfer"}</Text>
          {profile.handicap && (
            <Text style={styles.handicap}>HCP {profile.handicap}</Text>
          )}
          {profile.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          ) : (
            <Text style={styles.noBio}>Ready to hit the fairway...</Text>
          )}
        </View>
        <View style={styles.chatArrow}>
          <Ionicons name="chevron-forward" size={28} color="#22c55e" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Matches</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Finding your playing partners...</Text>
        </View>
      ) : matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={80} color="#475569" />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>Keep swiping — your perfect golf partner is out there!</Text>
        </View>
      )}

      {/* Chat Modal */}
      <Modal visible={!!selectedMatch} animationType="slide">
        {selectedMatch && (
          <ChatScreen user={user} match={selectedMatch} onClose={() => setSelectedMatch(null)} />
        )}
      </Modal>
    </LinearGradient>
  );
}