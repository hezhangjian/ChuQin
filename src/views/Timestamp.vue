<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.push('/');

const timestamp = ref('');
const date = ref('');
const currentTimestamp = computed(() => Math.floor(Date.now() / 1000));

const convertTimestampToDate = () => {
  if (!timestamp.value) return;
  const ts = parseInt(timestamp.value);
  if (isNaN(ts)) return;
  
  const dateObj = new Date(ts * 1000);
  date.value = dateObj.toLocaleString();
};

const convertDateToTimestamp = () => {
  if (!date.value) return;
  const dateObj = new Date(date.value);
  if (isNaN(dateObj.getTime())) return;
  
  timestamp.value = Math.floor(dateObj.getTime() / 1000).toString();
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1 class="text-2xl font-bold">时间戳转换</h1>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div class="space-y-6">
        <!-- Current Timestamp -->
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">当前时间戳</p>
          <div class="flex items-center space-x-2">
            <code class="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded">{{ currentTimestamp }}</code>
            <button 
              @click="copyToClipboard(currentTimestamp.toString())"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              复制
            </button>
          </div>
        </div>

        <!-- Timestamp to Date -->
        <div>
          <h2 class="text-lg font-semibold mb-4">时间戳转日期</h2>
          <div class="space-y-4">
            <div class="flex space-x-4">
              <input
                v-model="timestamp"
                type="number"
                placeholder="输入时间戳"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                @input="convertTimestampToDate"
              />
              <button
                @click="convertTimestampToDate"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                转换
              </button>
            </div>
            <div v-if="date" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">转换结果</p>
              <div class="flex items-center space-x-2">
                <code class="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded">{{ date }}</code>
                <button 
                  @click="copyToClipboard(date)"
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Date to Timestamp -->
        <div>
          <h2 class="text-lg font-semibold mb-4">日期转时间戳</h2>
          <div class="space-y-4">
            <div class="flex space-x-4">
              <input
                v-model="date"
                type="datetime-local"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                @input="convertDateToTimestamp"
              />
              <button
                @click="convertDateToTimestamp"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                转换
              </button>
            </div>
            <div v-if="timestamp" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">转换结果</p>
              <div class="flex items-center space-x-2">
                <code class="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded">{{ timestamp }}</code>
                <button 
                  @click="copyToClipboard(timestamp)"
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 