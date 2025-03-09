<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.push('/');
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1 class="text-2xl font-bold">华为云Token</h1>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <p class="text-gray-600 dark:text-gray-300">Huawei Cloud Token retrieval component coming soon...</p>
    </div>
  </div>
</template> 