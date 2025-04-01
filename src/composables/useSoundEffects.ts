import { ref, onMounted } from 'vue';
import defaultStartAudio from '../assets/sfx/start-recording.wav';
import defaultStopAudio from '../assets/sfx/stop-recording.wav';

export interface SoundEffect {
  name: string;
  url: string;
  isDefault: boolean;
}

export const useSoundEffects = () => {
  const audioPlaybackEnabled = ref(true);
  const startRecordingSound = ref<SoundEffect>({
    name: 'Default Start',
    url: defaultStartAudio,
    isDefault: true
  });
  const stopRecordingSound = ref<SoundEffect>({
    name: 'Default Stop',
    url: defaultStopAudio,
    isDefault: true
  });

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      // Load audio enabled setting
      const savedAudioEnabled = localStorage.getItem('audioPlaybackEnabled');
      if (savedAudioEnabled !== null) {
        audioPlaybackEnabled.value = JSON.parse(savedAudioEnabled);
      }

      // Load custom sound URLs
      const savedStartSound = localStorage.getItem('startRecordingSound');
      if (savedStartSound) {
        const parsed = JSON.parse(savedStartSound);
        startRecordingSound.value = parsed;
      }

      const savedStopSound = localStorage.getItem('stopRecordingSound');
      if (savedStopSound) {
        const parsed = JSON.parse(savedStopSound);
        stopRecordingSound.value = parsed;
      }
    } catch (error) {
      console.error('Failed to load sound settings:', error);
      // Fallback to defaults if there's an error
      resetToDefaults();
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('audioPlaybackEnabled', JSON.stringify(audioPlaybackEnabled.value));
    localStorage.setItem('startRecordingSound', JSON.stringify(startRecordingSound.value));
    localStorage.setItem('stopRecordingSound', JSON.stringify(stopRecordingSound.value));
  };

  // Toggle audio playback
  const toggleAudioPlayback = (value: boolean) => {
    audioPlaybackEnabled.value = value;
    saveSettings();
  };

  // Set custom start recording sound
  const setStartRecordingSound = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      startRecordingSound.value = {
        name: file.name,
        url,
        isDefault: false
      };
      saveSettings();
      return true;
    } catch (error) {
      console.error('Error setting start recording sound:', error);
      return false;
    }
  };

  // Set custom stop recording sound
  const setStopRecordingSound = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      stopRecordingSound.value = {
        name: file.name,
        url,
        isDefault: false
      };
      saveSettings();
      return true;
    } catch (error) {
      console.error('Error setting stop recording sound:', error);
      return false;
    }
  };

  // Reset to default sounds
  const resetToDefaults = () => {
    startRecordingSound.value = {
      name: 'Default Start',
      url: defaultStartAudio,
      isDefault: true
    };
    stopRecordingSound.value = {
      name: 'Default Stop',
      url: defaultStopAudio,
      isDefault: true
    };
    saveSettings();
  };

  // Play a sound
  const playSound = (soundEffect: SoundEffect) => {
    if (!audioPlaybackEnabled.value) return;
    
    try {
      const audio = new Audio(soundEffect.url);
      audio.play().catch(err => console.error('Failed to play sound:', err));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Initialize
  onMounted(() => {
    loadSettings();
  });

  return {
    audioPlaybackEnabled,
    startRecordingSound,
    stopRecordingSound,
    toggleAudioPlayback,
    setStartRecordingSound,
    setStopRecordingSound,
    resetToDefaults,
    playSound
  };
};