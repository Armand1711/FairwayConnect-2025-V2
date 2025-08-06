import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./src/firebaseConfig";
import AuthScreen from "./src/AuthScreen";
import OnboardingScreen from "./src/OnboardingScreen";
import HomeScreen from "./src/HomeScreen";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        const docRef = doc(db, "users", usr.uid);
        const docSnap = await getDoc(docRef);
        setNeedsOnboarding(!docSnap.exists());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  if (!user) return <AuthScreen onAuth={setUser} />;
  if (needsOnboarding) return <OnboardingScreen user={user} onComplete={() => setNeedsOnboarding(false)} />;
  return <HomeScreen user={user} onSignOut={() => setUser(null)} />;
}