<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Flyway 记录清理工具</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div class="space-y-4">
        <div class="form-group">
          <label for="ip" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            服务器 IP
          </label>
          <input 
            type="text" 
            id="ip" 
            v-model="config.ip" 
            placeholder="请输入服务器 IP 地址"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            密码
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="config.password" 
            placeholder="请输入密码"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div class="form-group">
          <label for="database" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            数据库名
          </label>
          <input 
            type="text" 
            id="database" 
            v-model="config.database" 
            placeholder="请输入数据库名"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button 
          @click="cleanRecords" 
          :disabled="isLoading"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {{ isLoading ? '清理中...' : '清理记录' }}
        </button>
      </div>

      <div 
        v-if="message" 
        :class="[
          'mt-4 p-4 rounded-md text-sm',
          messageType === 'success' 
            ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        ]"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

const config = ref({
  ip: '',
  password: '',
  database: ''
})

const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const cleanRecords = async () => {
  if (!config.value.ip || !config.value.password || !config.value.database) {
    message.value = '请填写所有必填字段'
    messageType.value = 'error'
    return
  }

  isLoading.value = true
  message.value = ''
  
  try {
    const result = await invoke('clean_flyway_records', {
      config: config.value
    })
    message.value = result as string
    messageType.value = 'success'
  } catch (error) {
    message.value = `清理失败: ${error}`
    messageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}
</script>
