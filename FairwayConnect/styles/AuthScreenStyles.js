import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Full-screen dark gradient background
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  // Centered card with glassmorphic effect
  card: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "rgba(30, 41, 59, 0.7)", // slate-800 with transparency
    borderRadius: 28,
    padding: 36,
    alignItems: "center",
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)", // green glow border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 30,
  },

  // TeeMatch logo — bold and glowing
  logo: {
    fontSize: 64,
    fontWeight: "900",
    color: "#22c55e",
    letterSpacing: 3,
    marginBottom: 12,
    textShadowColor: "rgba(34, 197, 94, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 18,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
    fontWeight: "500",
  },

  // Premium glass input fields
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    fontSize: 17,
    color: "#fff",
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.4)",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  // Main action button — glowing green
  button: {
    backgroundColor: "#22c55e",
    backgroundColor: "#22c55e",
    width: "100%",
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  // Switch mode text (Login to Sign Up)
  switchText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 28,
    textDecorationLine: "underline",
  },

  // Error message
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "#ef4444",
    borderWidth: 1,
    color: "#fca5a5",
    padding: 14,
    borderRadius: 16,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
    width: "100%",
  },

 
  backgroundIcon: {
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    opacity: 0.08,
  },
});