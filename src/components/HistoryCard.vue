<template>
  <div id="cont">
    <div id="header">
      <p>ID:{{ id }},</p>
      <p>Time: {{ new Date(time).toLocaleString() }}</p>
    </div>
    <div id="content">
      <p>{{ text }}</p>
    </div>
    <button id="copy-button" @click="handleCopy">Copy to Clipboard</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const emit = defineEmits(['copy']);

const props = defineProps<{
  id: number,
  text: string,
  time: string,
}>();

function handleCopy() {
  emit('copy', props.text);
}
</script>

<style scoped>
p {
  margin: 0;
  text-align: left;
}

#cont {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

#header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
  opacity: 0.7;
  width: 100%;
}

#content {
  margin-bottom: 10px;
  width: 100%;
}

#copy-button {
  padding: 8px 16px;
}
</style>