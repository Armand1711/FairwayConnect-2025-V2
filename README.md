# FairwayConnect

A mobile app for golfers to chat, organize, and book games—built with React Native and Firebase Firestore.

---

## 🃏 Inspiration Cards

This app was inspired by three "inspiration cards":
1. Connecting with others
2. Main Feture is swipe
3. Usable with one hand

I combined these ideas to make a chat-driven golf event organizer. Golfers can message, book games, and see event cards right in the chat!

---

## 🚀 Features

- **Card Swipe:** Swiping left or right to matc with golfers.
- **Chat:** Real-time messaging between matches.
- **Book Golf Games:** Create event cards with date, time, and location—directly in chat.
- **Smart Input:** Date/time fields auto-format as you type (`YYYY-MM-DD`, `HH:MM`).
- **Modern UI:** Mobile-friendly, clear, professional interface.

---

## 📱 Demo Video

Watch a full demonstration of the app here:  
[FairwayConnect – Demo Video](https://drive.google.com/file/d/1woNBBDMo9if4HzpfAlfdTjocsSBqVUsS/view?usp=sharing)

---

## 🗂️ Repo Structure

- `ChatScreen.js`: Main chat and booking UI logic.
- `ChatScreenStyles.js`: Styles for chat, forms, and cards.
- `firebaseConfig.js`: Firebase setup.
- `App.js`: Entry point (navigation, user context, etc.)

---

## 🔥 Main Functionality

- **Swipe:** Swipe left or right to get matched with a golfer and start chatting.
- **Chat:** Send/receive messages, styled bubbles.
- **Book Game:** Tap “Book Golf Game”, fill smart-form (auto-formatting date/time), submit, and see a game card in the chat.
- **Event Cards:** Displayed inline with messages, showing details and organizer.
- **Read Receipts:** “✔ Read” indicator seen on your messages once read by the other user.
- **Validation:** Prevents invalid date/time/location entry.

---

## 🔒 Firestore Data Model

Messages (including bookings) are stored in:
```
matches/{matchId}/messages
```
Each message or game booking is a document, with:
- `from`, `to`, `text`, `type`, `date`, `time`, `location`, `organizedBy`, `timestamp`, `read`

---

## 📄 Documentation & Support

- Full code is commented and readable.

---

## 📢 Notes

- The demonstration video is part of this submission and linked above.

---

---

**Thank you for checking out my project!**
