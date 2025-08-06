import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVZc1L9BxaUYOx_XCaFNfGeCUD1fr7WsE",
  authDomain: "fairwayconnect-2025.firebaseapp.com",
  databaseURL: "https://fairwayconnect-2025-default-rtdb.firebaseio.com",
  projectId: "fairwayconnect-2025",
  storageBucket: "fairwayconnect-2025.firebasestorage.app",
  messagingSenderId: "657734590072",
  appId: "1:657734590072:web:55f0865831e6abc460978d"
};

const app = initializeApp(firebaseConfig);

// Use persistent auth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };