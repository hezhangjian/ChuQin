<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.push('/');

const inputText = ref('');
const encodedText = ref('');
const decodedText = ref('');

const encode = () => {
  try {
    encodedText.value = encodeURIComponent(inputText.value);
  } catch (error) {
    encodedText.value = 'Error encoding text';
  }
};

const decode = () => {
  try {
    decodedText.value = decodeURIComponent(inputText.value);
  } catch (error) {
    decodedText.value = 'Error decoding text';
  }
};

const clearAll = () => {
  inputText.value = '';
  encodedText.value = '';
  decodedText.value = '';
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy text:', error);
  }
};
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1 class="text-2xl font-bold">URL编解码</h1>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-6">
      <!-- Input Section -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">输入文本</label>
        <div class="flex gap-2">
          <textarea
            v-model="inputText"
            rows="3"
            class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="输入要编码或解码的文本..."
          ></textarea>
          <div class="flex flex-col gap-2">
            <button
              @click="encode"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              编码
            </button>
            <button
              @click="decode"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              解码
            </button>
            <button
              @click="clearAll"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      <!-- Encoded Result -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">编码结果</label>
        <div class="flex gap-2">
          <textarea
            v-model="encodedText"
            rows="3"
            readonly
            class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
          ></textarea>
          <button
            @click="copyToClipboard(encodedText)"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            复制
          </button>
        </div>
      </div>

      <!-- Decoded Result -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">解码结果</label>
        <div class="flex gap-2">
          <textarea
            v-model="decodedText"
            rows="3"
            readonly
            class="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
          ></textarea>
          <button
            @click="copyToClipboard(decodedText)"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            复制
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 