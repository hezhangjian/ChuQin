<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MD5 from 'crypto-js/md5';

const router = useRouter();
const goBack = () => router.push('/');

const inputText = ref('');
const md5Result = ref('');

const generateMD5 = () => {
  if (inputText.value.trim()) {
    md5Result.value = MD5(inputText.value).toString();
  } else {
    md5Result.value = '';
  }
};
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1 class="text-2xl font-bold">MD5</h1>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div class="space-y-4">
        <div>
          <label for="input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入文本</label>
          <textarea
            id="input"
            v-model="inputText"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="请输入要哈希的文本..."
          ></textarea>
        </div>
        
        <button
          @click="generateMD5"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          生成MD5
        </button>

        <div v-if="md5Result" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MD5结果</label>
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <code class="text-sm text-gray-800 dark:text-gray-200 break-all">{{ md5Result }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 