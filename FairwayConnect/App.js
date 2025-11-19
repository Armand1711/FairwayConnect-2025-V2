import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./src/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import AuthScreen from "./src/AuthScreen";
import OnboardingScreen from "./src/OnboardingScreen";
import HomeScreen from "./src/HomeScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user has completed onboarding
        const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
        setUser(currentUser);
        setShowOnboarding(!profileSnap.exists());
      } else {
        setUser(null);
        setShowOnboarding(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onAuth={(u) => setUser(u)}
        onProfile={(u) => {
          setUser(u);
          setShowOnboarding(true);
        }}
      />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        user={user}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return <HomeScreen user={user} onSignOut={() => setUser(null)} />;
}