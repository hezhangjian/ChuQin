<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.push('/');

const hexValue = ref('');
const decimalValue = ref('');
const binaryValue = ref('');

const updateHex = (value: string) => {
  if (value === '') {
    decimalValue.value = '';
    binaryValue.value = '';
    return;
  }
  
  try {
    // Remove '0x' prefix if present
    const cleanHex = value.replace('0x', '');
    // Convert hex to decimal
    const decimal = parseInt(cleanHex, 16);
    if (isNaN(decimal)) {
      decimalValue.value = '';
      binaryValue.value = '';
      return;
    }
    decimalValue.value = decimal.toString();
    binaryValue.value = decimal.toString(2);
  } catch (error) {
    decimalValue.value = '';
    binaryValue.value = '';
  }
};

const updateDecimal = (value: string) => {
  if (value === '') {
    hexValue.value = '';
    binaryValue.value = '';
    return;
  }
  
  try {
    const decimal = parseInt(value);
    if (isNaN(decimal)) {
      hexValue.value = '';
      binaryValue.value = '';
      return;
    }
    hexValue.value = decimal.toString(16).toUpperCase();
    binaryValue.value = decimal.toString(2);
  } catch (error) {
    hexValue.value = '';
    binaryValue.value = '';
  }
};

const updateBinary = (value: string) => {
  if (value === '') {
    hexValue.value = '';
    decimalValue.value = '';
    return;
  }
  
  try {
    const decimal = parseInt(value, 2);
    if (isNaN(decimal)) {
      hexValue.value = '';
      decimalValue.value = '';
      return;
    }
    hexValue.value = decimal.toString(16).toUpperCase();
    decimalValue.value = decimal.toString();
  } catch (error) {
    hexValue.value = '';
    decimalValue.value = '';
  }
};

watch(hexValue, updateHex);
watch(decimalValue, updateDecimal);
watch(binaryValue, updateBinary);
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
        ← Back
      </button>
      <h1 class="text-2xl font-bold">HEX转换</h1>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hexadecimal</label>
          <div class="flex">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              0x
            </span>
            <input
              type="text"
              v-model="hexValue"
              class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter hex value"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decimal</label>
          <input
            type="text"
            v-model="decimalValue"
            class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter decimal value"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Binary</label>
          <input
            type="text"
            v-model="binaryValue"
            class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter binary value"
          />
        </div>
      </div>
    </div>
  </div>
</template> 