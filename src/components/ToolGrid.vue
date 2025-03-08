<script setup lang="ts">
interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: '1',
    name: 'AI Chat',
    icon: '🤖',
    description: '智能对话助手'
  },
  {
    id: '2',
    name: 'JSON格式化',
    icon: '📝',
    description: 'JSON美化与验证工具'
  },
  {
    id: '3',
    name: 'MD5加密',
    icon: '🔒',
    description: 'MD5哈希计算工具'
  },
  {
    id: '4',
    name: 'URL编解码',
    icon: '🔗',
    description: 'URL编码/解码转换'
  },
  {
    id: '5',
    name: 'HEX转换',
    icon: '🎨',
    description: '进制转换工具'
  },
  {
    id: '6',
    name: '时间戳转换',
    icon: '⏰',
    description: '时间戳与日期转换'
  }
];

const handleToolClick = (tool: Tool) => {
  console.log('Clicked tool:', tool.name);
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">楚秦</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="tool in tools"
        :key="tool.id"
        @click="handleToolClick(tool)"
        class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
      >
        <div class="flex flex-col items-center text-center space-y-2">
          <span class="text-4xl mb-2">{{ tool.icon }}</span>
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ tool.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ tool.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  min-height: calc(100vh - 2rem);
}
</style>