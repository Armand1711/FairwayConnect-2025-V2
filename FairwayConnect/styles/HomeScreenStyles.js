import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  swiperContainer: {
    flex: 1,
    paddingBottom: 130, // Only space for bottom nav
    paddingTop: 20,     // Minimal top margin
  },

  card: {
    height: height * 0.60,     // Bigger cards
    width: width - 50,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 40,
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  info: {
    position: "absolute",
    bottom: 60,
    left: 34,
    right: 34,
  },
  name: {
    fontSize: 46,
    color: "#fff",
    fontWeight: "bold",
  },
  hcp: {
    fontSize: 26,
    color: "#22c55e",
    marginTop: 8,
    fontWeight: "700",
  },
  bio: {
    fontSize: 20,
    color: "#e2e8f0",
    marginTop: 14,
    lineHeight: 28,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 30,
    color: "#94a3b8",
    fontWeight: "600",
  },

  // Bottom Nav — Clean & Fixed
  bottomNav: {
    position: "absolute",
    bottom: 35,
    left: 40,
    right: 40,
    backgroundColor: "rgba(30,41,59,0.98)",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 22,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#22c55e66",
    elevation: 50,
  },
  navBtn: {
    alignItems: "center",
  },
  navLabel: {
    color: "#22c55e",
    marginTop: 8,
    fontWeight: "800",
    fontSize: 16,
  },
});