# Whisgo Mobile - Whisper-Powered Instant Transcription Tool  

Whisgo Mobile is a cross-platform transcription app for **Android** and **iOS**, powered by **Capacitor**. It enables quick audio recording and transcription using the **Groq API**, providing an intuitive and seamless experience on mobile devices.  

![App Icon](/assets/icon-only.png)  

## Key Features  

- **Quick Recording:** Start and stop audio recording easily within the app.  
- **Groq API Integration:** Utilizes the Groq API for fast and accurate transcription.  
- **Transcription History:** Keeps a log of past transcriptions for easy reference.  
- **Clipboard Integration:** Automatically copies the latest transcription to your clipboard.  
- **Cross-Platform:** Available on both Android and iOS using Capacitor.  

## Building from source  

1. Install dependencies:  
   ```sh
   npm install
   ```
2. Sync Capacitor with native projects:  
   ```sh
   npx cap sync
   ```
3. Build the app:  
   ```sh
   npm run build
   ```
4. Run on a device or emulator:  
   ```sh
   npx cap run android  # For Android  
   npx cap run ios      # For iOS  
   ```

## How to Use  

**Set Your Groq API Key:** Enter your API key in the settings and you are set.  
