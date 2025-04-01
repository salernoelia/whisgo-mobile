import { ref } from "vue";

export interface Transcription {
  id: number;
  text: string;
  timestamp: string;
}

export const useGroq = () => {
  const apiKey = ref(localStorage.getItem("groq_api_key") || "");
  const model = ref(
    localStorage.getItem("groq_model") || "whisper-large-v3-turbo"
  );
  const status = ref("");
  const isProcessing = ref(false);

  // Save API key to local storage
  const saveApiKey = (key: string) => {
    apiKey.value = key;
    localStorage.setItem("groq_api_key", key);
    return "API key saved";
  };

  // Save selected model to local storage
  const saveModel = (selectedModel: string) => {
    model.value = selectedModel;
    localStorage.setItem("groq_model", selectedModel);
    return "Model saved";
  };

  // Send audio to Groq API for transcription
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    if (!apiKey.value) {
      throw new Error("API key is not set");
    }

    isProcessing.value = true;
    status.value = "Processing audio...";

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", model.value);
      formData.append("temperature", "0");
      formData.append("response_format", "json");
      formData.append("language", "en");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.value}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to transcribe audio"
        );
      }

      const data = await response.json();
      const transcription = data.text || "";

      return transcription;
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    apiKey,
    model,
    status,
    isProcessing,
    saveApiKey,
    saveModel,
    transcribeAudio,
  };
};
