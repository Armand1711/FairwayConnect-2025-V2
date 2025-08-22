# Golf Chat App

This is a React Native chat application for golfers. Users can chat with their matches, organize golf games, and book events directly in the chat interface. The app uses Firebase Firestore for real-time messaging and game booking.

## Features

- **Chat**: Send and receive messages in real-time.
- **Read Receipts**: See when your messages have been read (WhatsApp-style ✔ Read).
- **Organize & Book Golf Games**: Book games via a friendly form, with details posted as a card in the chat.
- **Smart Date & Time Input**: Date and time fields auto-format as you type (`YYYY-MM-DD` and `HH:MM`).
- **Mobile-friendly UI**: Styled for clarity, accessibility, and ease of use.

## Screenshots



## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure Firebase**
   - Create a file `firebaseConfig.js` in the root directory.
   - Add your Firebase configuration:
     ```js
     import { initializeApp } from "firebase/app";
     import { getFirestore } from "firebase/firestore";

     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       // ...other config
     };

     const app = initializeApp(firebaseConfig);
     export const db = getFirestore(app);
     ```

3. **Run the app**
   ```bash
   npx expo start
   ```
   or with React Native CLI:
   ```bash
   npx react-native run-android
   npx react-native run-ios
   ```

## Usage

- **Chat**: Select a match to start chatting.
- **Book a Golf Game**: Tap "📅 Book Golf Game", fill out the form (date auto-formats to `YYYY-MM-DD`, time to `HH:MM`), and submit. Your booking appears as a card in the chat.
- **Read Receipts**: If your message shows "✔ Read", the other user has seen it.

## Code Structure

- `ChatScreen.js`: Main chat interface and game booking logic.
- `ChatScreenStyles.js`: All styles for chat and game cards.
- `firebaseConfig.js`: Firebase initialization.
- `App.js`: Entry point (not shown here).

## Customization

- **Styling**: Tweak `ChatScreenStyles.js` for colors, spacing, etc.
- **Game Booking**: You can expand the booking form for more fields (e.g., number of players, tee time).
- **Localization**: Adjust date/time formatting for your region.

## Firestore Data Model

- **matches/{matchId}/messages**
  - Chat messages and golf game cards (with `type: "text"` or `type: "game"`)
  - Fields: `from`, `to`, `text`, `type`, `date`, `time`, `location`, `organizedBy`, `timestamp`, `read`
- **matches/{matchId}/games**
  - (Optional) Used in older versions for separate game storage

## Author

Armand Naude 
231181