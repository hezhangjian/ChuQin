<template>
  <div class="base64-converter">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1>Base64 Converter</h1>
    </div>
    <div class="converter-container">
      <div class="input-section">
        <h2>Input</h2>
        <textarea
          v-model="inputText"
          placeholder="Enter text to encode/decode..."
          rows="6"
          class="input-textarea"
        ></textarea>
      </div>
      
      <div class="button-section">
        <button @click="encode" class="action-button encode">Encode</button>
        <button @click="decode" class="action-button decode">Decode</button>
        <button @click="clear" class="action-button clear">Clear</button>
      </div>

      <div class="output-section">
        <h2>Output</h2>
        <textarea
          v-model="outputText"
          placeholder="Converted text will appear here..."
          rows="6"
          class="output-textarea"
          readonly
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.push('/');

const inputText = ref('');
const outputText = ref('');

const encode = () => {
  try {
    outputText.value = btoa(inputText.value);
  } catch (error) {
    outputText.value = 'Error: Invalid input for encoding';
  }
};

const decode = () => {
  try {
    outputText.value = atob(inputText.value);
  } catch (error) {
    outputText.value = 'Error: Invalid Base64 string';
  }
};

const clear = () => {
  inputText.value = '';
  outputText.value = '';
};
</script>

<style scoped>
.base64-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section, .output-section {
  flex: 1;
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.input-textarea, .output-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.button-section {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.encode {
  background-color: #4CAF50;
  color: white;
}

.decode {
  background-color: #2196F3;
  color: white;
}

.clear {
  background-color: #f44336;
  color: white;
}

.action-button:hover {
  opacity: 0.9;
}

.action-button:active {
  transform: scale(0.98);
}
</style>
