<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { invoke } from '@tauri-apps/api/core';

interface HuaweiCloudConfig {
  username: string;
  password: string;
  project_id: string;
}

const router = useRouter();
const goBack = () => router.push('/');

const username = ref('');
const password = ref('');
const domainName = ref('');
const loading = ref(false);
const token = ref('');
const error = ref('');

async function loadConfig() {
  try {
    const config = await invoke<HuaweiCloudConfig>('get_config');
    if (config) {
      username.value = config.username;
      password.value = config.password;
      domainName.value = config.username; // 账号名与用户名相同
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load config';
  }
}

async function getToken() {
  loading.value = true;
  error.value = '';
  token.value = '';
  
  try {
    const tokenValue = await invoke('huaweicloud_get_token', {
      credentials: {
        username: username.value,
        password: password.value,
        domain_name: domainName.value,
        project_name: 'cn-north-4' // 固定使用北京四区
      }
    });
    
    token.value = tokenValue as string;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to get token';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
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
      <form @submit.prevent="getToken" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username (IAM用户名)
          </label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password (密码)
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Domain Name (账号名)
          </label>
          <input
            v-model="domainName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name (项目名)
          </label>
          <input
            value="cn-north-4"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">固定使用北京四区</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? 'Getting Token...' : 'Get Token' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>

      <div v-if="token" class="mt-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Your Token:</h3>
        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          <p class="text-sm font-mono break-all">{{ token }}</p>
        </div>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This token is valid for 24 hours. Please store it securely.
        </p>
      </div>
    </div>
  </div>
</template> 