import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-deck-swiper";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import ProfileScreen from "./ProfileScreen";
import MatchesScreen from "./MatchesScreen";
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen({ user, onSignOut }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [user]);

  const fetchCards = async () => {
    try {
      // 1. Get all potential cards
      const allSnap = await getDocs(collection(db, "cards"));
      let potential = allSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.uid !== user.uid);

      // 2. Get all current matches for this user
      const matchesSnap = await getDocs(
        query(collection(db, "matches"), where("users", "array-contains", user.uid))
      );

      const matchedUserIds = new Set();
      matchesSnap.forEach((matchDoc) => {
        const users = matchDoc.data().users;
        const otherUser = users.find((u) => u !== user.uid);
        if (otherUser) matchedUserIds.add(otherUser);
      });

      // 3. Remove matched users from feed
      const filteredCards = potential.filter((card) => !matchedUserIds.has(card.uid));

      setCards(filteredCards);
    } catch (err) {
      console.log("Error fetching cards:", err);
    }
    setLoading(false);
  };

  const handleLike = async (index) => {
    const liked = cards[index];
    if (!liked) return;

    await setDoc(doc(db, "likes", `${user.uid}_${liked.uid}`), {
      from: user.uid,
      to: liked.uid,
      timestamp: serverTimestamp(),
    });

    const match = await getDoc(doc(db, "likes", `${liked.uid}_${user.uid}`));
    if (match.exists()) {
      const matchId = [user.uid, liked.uid].sort().join("_");
      await setDoc(doc(db, "matches", matchId), {
        users: [user.uid, liked.uid],
        createdAt: serverTimestamp(),
      });
      Alert.alert("It's a Match!", `You and ${liked.displayName} matched!`);
    }
  };

  const renderCard = (card) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: card.photoUrl || "https://images.unsplash.com/photo-1622552219012-2e1f4134c17e?w=800",
        }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.gradient} />

      <View style={styles.info}>
        <Text style={styles.name}>{card.displayName || "Golfer"}</Text>
        {card.handicap && <Text style={styles.hcp}>HCP {card.handicap}</Text>}
        <Text style={styles.bio}>{card.bio || "Ready to play..."}</Text>
      </View>
    </View>
  );

  const overlayLabels = {
    left: {
      title: "NOPE",
      style: { label: { borderWidth: 8, borderColor: "#ef4444", color: "#ef4444", fontSize: 80, fontWeight: "900", transform: [{ rotate: "-30deg" }] } },
    },
    right: {
      title: "BIRDIE!",
      style: { label: { borderWidth: 8, borderColor: "#22c55e", color: "#22c55e", fontSize: 80, fontWeight: "900", transform: [{ rotate: "30deg" }] } },
    },
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <View style={styles.swiperContainer}>
        {cards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No new golfers nearby</Text>
          </View>
        ) : (
          <Swiper
            cards={cards}
            renderCard={renderCard}
            onSwipedRight={handleLike}
            onSwipedAll={() => Alert.alert("All done", "You've seen everyone nearby!")}
            backgroundColor="transparent"
            cardVerticalMargin={60}
            cardHorizontalMargin={20}
            stackSize={3}
            stackSeparation={18}
            overlayLabels={overlayLabels}
            animateOverlayLabelsOpacity
            animateCardOpacity
            verticalSwipe={false}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setShowMatches(true)} style={styles.navBtn}>
          <Ionicons name="chatbubbles" size={34} color="#22c55e" />
          <Text style={styles.navLabel}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowProfile(true)} style={styles.navBtn}>
          <Ionicons name="person" size={34} color="#22c55e" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showProfile} animationType="slide">
        <ProfileScreen user={user} onClose={() => setShowProfile(false)} onLogout={onSignOut} />
      </Modal>
      <Modal visible={showMatches} animationType="slide">
        <MatchesScreen user={user} onClose={() => setShowMatches(false)} />
      </Modal>
    </LinearGradient>
  );
}