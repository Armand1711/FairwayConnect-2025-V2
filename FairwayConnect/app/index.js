import AuthScreen from '../src/AuthScreen'; 
import HomeScreen from '../src/HomeScreen'; 
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/firebaseConfig"; 

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  return user ? (
    <HomeScreen user={user} onSignOut={() => setUser(null)} />
  ) : (
    <AuthScreen onAuth={setUser} />
  );
}