import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: { padding: 8 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },

  list: { padding: 20, paddingTop: 10 },
  matchCard: {
    flexDirection: "row",
    backgroundColor: "rgba(30,41,59,0.6)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#22c55e",
  },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  handicap: {
    fontSize: 16,
    color: "#22c55e",
    fontWeight: "600",
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    color: "#cbd5e1",
    marginTop: 6,
    lineHeight: 20,
  },
  noBio: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 6,
  },
  chatArrow: { padding: 8 },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 20, fontSize: 18, color: "#94a3b8" },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});