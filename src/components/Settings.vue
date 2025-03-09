<template>
  <div class="settings-button" @click="openDialog">
    <i class="fas fa-cog"></i>
  </div>

  <div v-if="dialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold dark:text-white">系统设置</h2>
        <button @click="dialogVisible = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">华为云账号</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入华为云账号"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">华为云密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入华为云密码"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Project ID</label>
          <input
            v-model="form.project_id"
            type="text"
            placeholder="请输入北京四Region的Project ID"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
        </div>
      </form>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="dialogVisible = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          取消
        </button>
        <button
          @click="saveSettings"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'

interface HuaweiCloudConfig {
  username: string;
  password: string;
  project_id: string;
}

const dialogVisible = ref(false)
const form = ref<HuaweiCloudConfig>({
  username: '',
  password: '',
  project_id: ''
})

const openDialog = () => {
  dialogVisible.value = true
  loadSettings()
}

const loadSettings = async () => {
  try {
    const config = await invoke<HuaweiCloudConfig>('get_config')
    if (config) {
      form.value = config
    }
  } catch (error) {
    alert('加载配置失败：' + error)
  }
}

const saveSettings = async () => {
  try {
    await invoke('save_config', { config: form.value })
    alert('保存成功')
    dialogVisible.value = false
  } catch (error) {
    alert('保存失败：' + error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-button {
  position: fixed;
  left: 20px;
  bottom: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.settings-button:hover {
  transform: rotate(30deg);
  background-color: #2563eb;
}
</style> 