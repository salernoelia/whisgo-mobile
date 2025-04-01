import { ref, onMounted } from "vue";

export interface Transcription {
  id: number;
  text: string;
  timestamp: string;
}

export const useTranscriptionHistory = () => {
  const history = ref<Transcription[]>([]);

  // Load history from localStorage
  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem("transcription_history");
      if (savedHistory) {
        history.value = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error("Failed to load transcription history:", error);
    }
  };

  // Save history to localStorage
  const saveHistory = () => {
    try {
      localStorage.setItem(
        "transcription_history",
        JSON.stringify(history.value)
      );
    } catch (error) {
      console.error("Failed to save transcription history:", error);
    }
  };

  // Add a new transcription to history
  const addTranscription = (text: string) => {
    const newTranscription = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
    };

    history.value = [newTranscription, ...history.value].slice(0, 20);
    saveHistory();

    return newTranscription;
  };

  // Clear all history
  const clearHistory = () => {
    history.value = [];
    saveHistory();
  };

  // Initialize on component mount
  onMounted(() => {
    loadHistory();
  });

  return {
    history,
    addTranscription,
    clearHistory,
  };
};
