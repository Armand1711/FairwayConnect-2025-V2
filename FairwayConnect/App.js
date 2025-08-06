import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebaseConfig";
import AuthScreen from "./src/AuthScreen";
import HomeScreen from "./src/HomeScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, usr => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;
  if (!user) return <AuthScreen onAuth={setUser} />;
  return <HomeScreen user={user} onSignOut={() => setUser(null)} />;
}