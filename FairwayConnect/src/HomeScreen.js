import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, SafeAreaView } from "react-native";
import Swiper from "react-native-deck-swiper";
import ProfileScreen from "./ProfileScreen";
import MatchesScreen from "./MatchesScreen"; 
import { db } from "./firebaseConfig";
import { collection, getDocs, setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import styles from "../styles/HomeScreenStyles"; 

export default function HomeScreen({ user, onSignOut }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "cards"));
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(card => card.uid !== user.uid);
        setCards(data);
      } catch (err) {
        console.log("Error fetching cards:", err);
        setCards([]);
      }
      setLoading(false);
    };
    fetchCards();
  }, [user]);

  // Swiping right = like
  const handleSwipeRight = useCallback(async (cardIndex) => {
    const likedUser = cards[cardIndex];
    if (!likedUser) return;

    try {
      // Record like
      await setDoc(doc(db, "likes", `${user.uid}_${likedUser.uid}`), {
        from: user.uid,
        to: likedUser.uid,
        timestamp: serverTimestamp(),
      });

      // Check like
      const reciprocal = await getDoc(doc(db, "likes", `${likedUser.uid}_${user.uid}`));
      if (reciprocal.exists()) {
        // Create match
        const matchId = `${[user.uid, likedUser.uid].sort().join("_")}`;
        await setDoc(doc(db, "matches", matchId), {
          users: [user.uid, likedUser.uid],
          createdAt: serverTimestamp(),
          game: null, 
        });

        Alert.alert(
          "It's a match!",
          `You and ${likedUser.displayName} can now chat and organize a golf game.`,
          [
            { text: "Chat Now", onPress: () => setShowMatches(true) },
            { text: "OK" }
          ]
        );
      }
    } catch (err) {
      console.log("Error on swipe right:", err);
    }
  }, [cards, user]);

  const renderCard = (card) => (
    <View key={card.id} style={styles.card}>
      <View style={styles.imageContainer}>
        {card.photoUrl ? (
          <Image source={{ uri: card.photoUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.noPhoto]}>
            <Text style={styles.noPhotoText}>No Photo</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
      </View>
      <Text style={styles.cardTitle}>{card.displayName}</Text>
      <Text style={styles.cardDesc}>{card.bio}</Text>
      <View style={styles.interestsContainer}>
        {card.interests && card.interests.map((interest, i) => (
          <View key={i} style={styles.interestChip}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.gradientBackground}>
      <View style={styles.header}>
        <Text style={styles.logoText}>⛳️ FairwayConnect</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.matchesBtn} onPress={() => setShowMatches(true)}>
            <Text style={styles.matchesText}>🏌️‍♂️ Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
            <Text style={styles.profileText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.swiperContainer}>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#228B22" />
        ) : (
          cards.length > 0 ? (
            <Swiper
              cards={cards}
              renderCard={renderCard}
              cardIndex={0}
              backgroundColor="transparent"
              stackSize={3}
              stackSeparation={18}
              verticalSwipe={false}
              onSwipedRight={handleSwipeRight}
              containerStyle={{ height: 480 }}
            />
          ) : (
            <Text style={styles.noCardsText}>No players to show</Text>
          )
        )}
      </View>
      <Modal visible={showProfile} animationType="slide">
        <ProfileScreen
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={onSignOut}
        />
      </Modal>
      <Modal visible={showMatches} animationType="slide">
        <MatchesScreen
          user={user}
          onClose={() => setShowMatches(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}