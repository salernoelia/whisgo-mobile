<template>
    <div class="sound-settings">
      <h3>Sound Settings</h3>
      
      <div class="settings-row">
        <input 
          type="checkbox" 
          id="audioPlaybackEnabled" 
          :checked="audioEnabled" 
          @change="handleAudioToggle"
        />
        <label for="audioPlaybackEnabled">Enable audio signals</label>
      </div>
      
      <div class="sound-selector">
        <div class="sound-item">
          <div class="sound-label">
            <span>Start Recording Sound:</span>
            <span class="sound-name">{{ startSound.name }}</span>
          </div>
          <div class="sound-actions">
            <button class="play-button" @click="$emit('play-start')" :disabled="!audioEnabled">
              Play
            </button>
            <label class="file-select-button">
              Browse
              <input 
                type="file" 
                accept="audio/*" 
                @change="handleStartSoundChange" 
                hidden
              />
            </label>
          </div>
        </div>
        
        <div class="sound-item">
          <div class="sound-label">
            <span>Stop Recording Sound:</span>
            <span class="sound-name">{{ stopSound.name }}</span>
          </div>
          <div class="sound-actions">
            <button class="play-button" @click="$emit('play-stop')" :disabled="!audioEnabled">
              Play
            </button>
            <label class="file-select-button">
              Browse
              <input 
                type="file" 
                accept="audio/*" 
                @change="handleStopSoundChange" 
                hidden
              />
            </label>
          </div>
        </div>
      </div>
      
      <button class="reset-button" @click="$emit('reset-sounds')">
        Reset to Default Sounds
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import type { SoundEffect } from '../composables/useSoundEffects';
  
  const props = defineProps<{
    audioEnabled: boolean;
    startSound: SoundEffect;
    stopSound: SoundEffect;
  }>();
  
  const emit = defineEmits([
    'toggle-audio', 
    'set-start-sound', 
    'set-stop-sound', 
    'play-start', 
    'play-stop', 
    'reset-sounds'
  ]);
  
  function handleAudioToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('toggle-audio', target.checked);
  }
  
  function handleStartSoundChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      emit('set-start-sound', input.files[0]);
    }
  }
  
  function handleStopSoundChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      emit('set-stop-sound', input.files[0]);
    }
  }
  </script>
  
  <style scoped>
  .sound-settings {
    padding: 10px 0;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  .sound-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 15px 0;
  }
  
  .sound-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .sound-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  
  .sound-name {
    font-size: 12px;
    opacity: 0.7;
    font-style: italic;
    word-break: break-all;
  }
  
  .sound-actions {
    display: flex;
    gap: 10px;
  }
  
  .play-button, .file-select-button {
    flex: 1;
    padding: 6px 12px;
    font-size: 14px;
    text-align: center;
    background-color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: white;
  }
  
  .play-button:hover, .file-select-button:hover {
    background-color: #444;
  }
  
  .play-button:disabled {
    background-color: #222;
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .file-select-button {
    display: inline-block;
  }
  
  .reset-button {
    width: 100%;
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #444;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
  }
  
  .reset-button:hover {
    background-color: #555;
  }
  
  .settings-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  </style>