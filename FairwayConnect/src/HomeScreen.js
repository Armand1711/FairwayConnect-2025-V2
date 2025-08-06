import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import Swiper from "react-native-deck-swiper";

export default function HomeScreen({ user, onSignOut }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cards from Firestore, excluding this user's own card
  const fetchCards = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "cards"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(card => card.uid !== user.uid); // exclude own card
    setCards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const renderCard = (card) => (
    <View key={card.id} style={styles.card}>
      {card.photoUrl ? (
        <Image source={{ uri: card.photoUrl }} style={styles.cardImage} />
      ) : null}
      <Text style={styles.cardTitle}>{card.displayName}</Text>
      <Text style={styles.cardDesc}>{card.bio}</Text>
      <Text style={styles.cardInterests}>
        Interests: {(card.interests && Array.isArray(card.interests)) ? card.interests.join(", ") : "None"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>FairwayConnect</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={async () => { await signOut(auth); onSignOut(); }}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> : (
        cards.length > 0 ? (
          <Swiper
            cards={cards}
            renderCard={renderCard}
            cardIndex={0}
            backgroundColor="#fff"
            stackSize={3}
            stackSeparation={20}
            verticalSwipe={false}
          />
        ) : (
          <Text style={{ textAlign: "center", marginTop: 40 }}>No cards to show</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "#f0f0f0" },
  title: { fontSize: 20, fontWeight: "bold", color: "#228B22" },
  signOutBtn: { backgroundColor: "#FFD700", borderRadius: 16, padding: 8 },
  signOutText: { color: "#228B22", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 18, alignItems: "center", elevation: 3, width: 320, height: 420 },
  cardImage: { width: 240, height: 160, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 6, color: "#228B22" },
  cardDesc: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 6 },
  cardInterests: { fontSize: 14, color: "#888" }
});