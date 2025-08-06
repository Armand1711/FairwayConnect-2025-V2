import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Swiper from "react-native-deck-swiper";

export default function HomeScreen({ user, onSignOut }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // READ: Load cards from Firestore
  const fetchCards = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "cards"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // CREATE: Add a card
  const addCard = async () => {
    if (!newTitle || !newDesc) {
      Alert.alert("Missing info", "Title and description required.");
      return;
    }
    setIsAdding(true);
    await addDoc(collection(db, "cards"), {
      title: newTitle,
      description: newDesc,
      imageUrl: newImage || null,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    });
    setNewTitle(""); setNewDesc(""); setNewImage("");
    setIsAdding(false);
    fetchCards();
  };

  // UPDATE: Example to update a card's title
  const updateCardTitle = async (cardId, newTitle) => {
    await updateDoc(doc(db, "cards", cardId), { title: newTitle });
    fetchCards();
  };

  // DELETE: Remove a card
  const deleteCardById = async (cardId) => {
    await deleteDoc(doc(db, "cards", cardId));
    fetchCards();
  };

  // SWIPER: Swipe action callbacks
  const onSwiped = (cardIndex) => {
    // Example: Delete card on swipe right
    // const cardId = cards[cardIndex].id;
    // deleteCardById(cardId);
  };

  // UI for adding a card
  const renderAddCard = () => (
    <View style={styles.addContainer}>
      <Text style={styles.sectionTitle}>Add Card</Text>
      <TextInput style={styles.input} placeholder="Title" value={newTitle} onChangeText={setNewTitle} />
      <TextInput style={styles.input} placeholder="Description" value={newDesc} onChangeText={setNewDesc} />
      <TextInput style={styles.input} placeholder="Image URL (optional)" value={newImage} onChangeText={setNewImage} />
      <TouchableOpacity style={styles.button} onPress={addCard} disabled={isAdding}>
        <Text style={styles.buttonText}>{isAdding ? "Adding..." : "Add Card"}</Text>
      </TouchableOpacity>
    </View>
  );

  // UI for each card
  const renderCard = (card) => (
    <View key={card.id} style={styles.card}>
      {card.imageUrl ? (
        <Image source={{ uri: card.imageUrl }} style={styles.cardImage} />
      ) : null}
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardDesc}>{card.description}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => {
          Alert.prompt("Update Title", "Enter new title", [
            { text: "Cancel", style: "cancel" },
            { text: "Update", onPress: (newTitle) => updateCardTitle(card.id, newTitle) }
          ]);
        }}>
          <Text style={styles.cardAction}>Edit Title</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Delete?", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteCardById(card.id) }
        ])}>
          <Text style={[styles.cardAction, { color: "red" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.email}!</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={async () => { await signOut(auth); onSignOut(); }}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> : (
        cards.length > 0 ? (
          <Swiper
            cards={cards}
            renderCard={renderCard}
            onSwiped={onSwiped}
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
      {renderAddCard()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "#f0f0f0" },
  title: { fontSize: 20, fontWeight: "bold", color: "#228B22" },
  signOutBtn: { backgroundColor: "#FFD700", borderRadius: 16, padding: 8 },
  signOutText: { color: "#228B22", fontWeight: "bold" },
  addContainer: { padding: 18, borderTopWidth: 1, borderColor: "#ddd", marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#228B22", marginBottom: 12 },
  input: { height: 40, borderWidth: 1, borderColor: "#228B22", borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  button: { backgroundColor: "#FFD700", borderRadius: 14, paddingVertical: 10, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#228B22", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 18, alignItems: "center", elevation: 3 },
  cardImage: { width: 240, height: 160, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#228B22" },
  cardDesc: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 8 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", width: "80%" },
  cardAction: { color: "#228B22", fontWeight: "bold", marginHorizontal: 12 }
});