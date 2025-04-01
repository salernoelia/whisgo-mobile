<template>
  <div class="container">
    <dialog id="settings" ref="settingsDialog">
      <button @click="closeSettings" autofocus>Close</button>



      <div class="container-left">
        <div class="groq-key-input" style="display: flex; gap: 10px; align-items: center;">
          <label for="groq-key-input">Key:</label>
          <input style="width: 100%;" type="text" v-model="groqKey" id="groq-key-input"
            placeholder="Enter your GROQ key" />
          <button style="width: fit-content;" @click="saveAPIKey">Save</button>
        </div>



        <div class="settings-row">
          <select name="model" id="model-selector" v-model="selectedModel" @change="saveModel">
            <option value="distil-whisper-large-v3-en">distil-whisper-large-v3-en</option>
            <option value="whisper-large-v3">whisper-large-v3</option>
            <option value="whisper-large-v3-turbo">whisper-large-v3-turbo</option>
          </select>
        </div>

        <div class="settings-row">
          <select name="device" id="device-selector" v-model="selectedDeviceId" @change="changeDevice">
            <option v-for="device in audioDevices" :key="device.deviceId" :value="device.deviceId">
              {{ device.label || `Microphone ${device.deviceId.slice(0, 5)}...` }}
            </option>
          </select>
        </div>

        <div class="settings-section">
          <SoundSettings :audioEnabled="audioPlaybackEnabled" :startSound="startRecordingSound"
            :stopSound="stopRecordingSound" @toggle-audio="toggleAudioPlayback"
            @set-start-sound="setStartRecordingSound" @set-stop-sound="setStopRecordingSound"
            @play-start="handlePlaySound('start')" @play-stop="handlePlaySound('stop')"
            @reset-sounds="resetToDefaults" />

        </div>



      </div>
    </dialog>

    <div class="container-right">
      <div class="recording-controls">
        <div v-if="recordingStatus" class="status-message">
          {{ recordingStatus }}
        </div>
        <button class="record-button" :class="{ 'recording': isRecording }" @click="toggleRecording"
          :disabled="!groqKey || isProcessing">
          {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
        </button>
        <div v-if="!groqKey" class="error-message">
          Please enter your Groq API key to start recording.
        </div>
        <div v-if="audioError" class="error-message">
          {{ audioError }}
        </div>
      </div>

      <button @click="openSettings">Settings</button>
      <button @click="clearTranscriptionHistory">Clear History</button>

      <div class="history-area" ref="historyArea">
        <HistoryCard v-for="transcription in transcriptions" :key="transcription.id" :id="transcription.id"
          :text="transcription.text" :time="transcription.timestamp" @copy="copyToClipboard" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { EventsOn, EventsOff } from '../wailsjs/runtime/runtime';
import HistoryCard from './components/HistoryCard.vue';
import { useGroq } from './composables/useGroq';
import { useAudioRecording } from './composables/useAudioRecording';
import { useTranscriptionHistory } from './composables/useTranscriptionHistory';
import { CopyToClipboard, HideWindow } from '../wailsjs/go/main/App';
import { useSoundEffects } from './composables/useSoundEffects';
import SoundSettings from './components/SoundSettings.vue';

// Initialize composables
const {
  apiKey: groqKey,
  model: selectedModel,
  isProcessing,
  saveApiKey,
  saveModel: saveModelSetting,
  transcribeAudio
} = useGroq();

const {
  isRecording,
  audioData,
  error: audioError,
  availableDevices,
  selectedDevice: selectedDeviceId,
  initAudioDevices,
  selectDevice,
  startRecording,
  stopRecording
} = useAudioRecording();

const {
  history: transcriptions,
  addTranscription,
  clearHistory
} = useTranscriptionHistory();

const {
  audioPlaybackEnabled,
  startRecordingSound,
  stopRecordingSound,
  toggleAudioPlayback,
  setStartRecordingSound,
  setStopRecordingSound,
  resetToDefaults,
  playSound
} = useSoundEffects();



// Local refs
const historyArea = ref<HTMLDivElement | null>(null);
const settingsDialog = ref<HTMLDialogElement | null>(null);
const recordingStatus = ref('');
const currentTranscription = ref('');


// Computed for UI
const audioDevices = computed(() => {
  return availableDevices.value;
});

const openSettings = () => {
  if (settingsDialog.value) {
    settingsDialog.value.showModal();
  }
};

const closeSettings = () => {
  if (settingsDialog.value) {
    settingsDialog.value.close();
  }
};

const handlePlaySound = (type: 'start' | 'stop') => {
  if (type === 'start') {
    playSound(startRecordingSound.value);
  } else {
    playSound(stopRecordingSound.value);
  }
};


onMounted(async () => {
  try {
    // Initialize audio devices
    await initAudioDevices();

    // Load saved settings
    audioPlaybackEnabled.value = JSON.parse(localStorage.getItem('audioPlaybackEnabled') || 'true');

    // Listen for hotkey trigger event from Go backend
    EventsOn('hotkey-triggered', () => {
      toggleRecording();
    });
  } catch (error) {
    console.error('Error during initialization:', error);
    recordingStatus.value = 'Failed to initialize';
  }
});

onUnmounted(() => {
  EventsOff('hotkey-triggered');
});

async function changeDevice() {
  try {
    selectDevice(selectedDeviceId.value);
  } catch (error) {
    console.error('Error setting audio device:', error);
  }
}

async function refreshDevices() {
  try {
    await initAudioDevices();
    recordingStatus.value = 'Devices refreshed';
  } catch (error) {
    console.error('Error refreshing devices:', error);
    recordingStatus.value = 'Failed to refresh devices';
  }
}

async function toggleRecording() {
  try {
    if (isRecording.value) {
      recordingStatus.value = 'Stopping recording...';
      HideWindow();

      const audioBlob = await stopRecording();

      recordingStatus.value = 'Transcribing...';
      const transcription = await transcribeAudio(audioBlob);

      addTranscription(transcription);
      currentTranscription.value = transcription;

      historyArea.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      await copyToClipboard(transcription);
      recordingStatus.value = 'Transcription complete and copied to clipboard';
      handlePlaySound('stop'); // Updated to use our new sound handler
    } else {
      if (!groqKey.value) {
        recordingStatus.value = 'Please set your Groq API key';
        return;
      }

      await startRecording();
      handlePlaySound('start'); // Updated to use our new sound handler
      recordingStatus.value = 'Recording started';
    }
  } catch (error) {
    console.error('Error during recording process:', error);
    recordingStatus.value = error instanceof Error ? error.message : 'Error with recording';
    isRecording.value = false;
  }
}


function saveAPIKey() {
  try {
    recordingStatus.value = saveApiKey(groqKey.value);
    closeSettings();
  } catch (error) {
    console.error('Error saving API key:', error);
    recordingStatus.value = 'Failed to save API key';
  }
}

function saveModel() {
  try {
    recordingStatus.value = saveModelSetting(selectedModel.value);
  } catch (error) {
    console.error('Error saving model:', error);
    recordingStatus.value = 'Failed to save model';
  }
}

async function copyToClipboard(text: string) {
  try {
    await CopyToClipboard(text);
    recordingStatus.value = 'Copied to clipboard';
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    recordingStatus.value = 'Failed to copy to clipboard';
    return false;
  }
}

function clearTranscriptionHistory() {
  clearHistory();
  recordingStatus.value = 'History cleared';
}
</script>

<style>
.container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0 auto;
  gap: 0;
  height: 100vh;
  width: 100%;
  justify-content: center;
  padding-top: 20px;
}

.container-left {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.container-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 85%;
}

.history-area {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
}

h1 {
  font-size: 24px;
  margin-bottom: 15px;
}

#settings {
  width: 80%;
  background-color: #1d1d1d;
  color: white;
}

.settings-row {
  display: flex;
  align-items: center;
}

label {
  font-weight: 500;
  width: 100px;
}

#model-selector,
#device-selector {
  flex: 1;
  font-size: 1em;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.recording-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.record-button {
  padding: 8px 24px;
  width: 100%;
  font-size: 16px;
  background-color: #101010;
  border: 1px solid #8f8f8f;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button {
  padding: 8px 15px;
  font-size: 16px;
  background-color: #292929;
  border: 1px solid #8f8f8f;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #333;
}

input {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #292929;
  color: white;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #292929;
  color: white;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.record-button:hover {
  background-color: #09420c;
}

.record-button.recording {
  background-color: #58120d;
}

.record-button.recording:hover {
  background-color: #8e2222;
}

.status-message {
  margin-bottom: 10px;
  font-size: 14px;
  padding: 6px 3px;
  color: #666;
  width: 100%;
  text-align: center;
  border: 1px dashed #434343;
  box-sizing: border-box;
}

textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

ul {
  list-style-type: none;
  padding: 0;
}

.error-message {
  color: red;
  margin-top: 10px;
}

::backdrop {
  background-color: #292929;
  opacity: 0.75;
}


.settings-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #444;
  padding-bottom: 15px;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.settings-header {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}
</style>