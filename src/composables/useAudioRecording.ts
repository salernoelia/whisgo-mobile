import { ref, onUnmounted } from "vue";

export const useAudioRecording = () => {
  const isRecording = ref(false);
  const audioData = ref<Blob | null>(null);
  const error = ref("");
  const mediaRecorder = ref<MediaRecorder | null>(null);
  const audioChunks = ref<BlobPart[]>([]);
  const availableDevices = ref<MediaDeviceInfo[]>([]);
  const selectedDevice = ref("");

  // Initialize and get available audio devices
  const initAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      availableDevices.value = devices.filter(
        (device) => device.kind === "audioinput"
      );

      if (availableDevices.value.length > 0) {
        // Try to restore previously selected device or use default
        const savedDeviceId = localStorage.getItem("selected_audio_device");
        const deviceExists = availableDevices.value.some(
          (d) => d.deviceId === savedDeviceId
        );

        selectedDevice.value =
          deviceExists && savedDeviceId
            ? savedDeviceId
            : availableDevices.value[0].deviceId;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      error.value = "Failed to access audio devices. Please check permissions.";
    }
  };

  // Select audio device
  const selectDevice = (deviceId: string) => {
    selectedDevice.value = deviceId;
    localStorage.setItem("selected_audio_device", deviceId);
  };

  // Start recording
  const startRecording = async () => {
    try {
      audioChunks.value = [];
      error.value = "";

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice.value
          ? { deviceId: { exact: selectedDevice.value } }
          : true,
      });

      mediaRecorder.value = new MediaRecorder(stream);

      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data);
        }
      };

      mediaRecorder.value.onstop = () => {
        audioData.value = new Blob(audioChunks.value, { type: "audio/webm" });

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.value.start();
      isRecording.value = true;
      return "Recording started";
    } catch (err) {
      console.error("Recording error:", err);
      error.value = `Failed to start recording: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      isRecording.value = false;
      throw err;
    }
  };

  // Stop recording
  const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === "inactive") {
        isRecording.value = false;
        reject(new Error("Not currently recording"));
        return;
      }

      mediaRecorder.value.onstop = () => {
        const blob = new Blob(audioChunks.value, { type: "audio/webm" });
        audioData.value = blob;
        isRecording.value = false;
        resolve(blob);
      };

      mediaRecorder.value.stop();
    });
  };

  // Clean up on component unmount
  onUnmounted(() => {
    if (mediaRecorder.value && mediaRecorder.value.state !== "inactive") {
      mediaRecorder.value.stop();
    }
  });

  return {
    isRecording,
    audioData,
    error,
    availableDevices,
    selectedDevice,
    initAudioDevices,
    selectDevice,
    startRecording,
    stopRecording,
  };
};
