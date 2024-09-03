<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col sm:inline-flex sm:flex-row rounded-lg shadow-sm">
      <button type="button" @click="fetchUserData('')" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        API 1
      </button>
      <button type="button" @click="fetchUserData('')" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        API 2
      </button>
      <button type="button" @click="fetchUserData('')" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        API 3
      </button>
    </div>
    <div class="flex flex-wrap my-10 -mx-2">

      <div v-if="userData">
        {{ userData }}
      </div>
      <!-- Fallback or loading state -->
      <div v-else>
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

onMounted(() => {
  //userStore.fetchUserCredentials('Takis');
});

const fetchUserData = (apiType) => {
  userStore.fetchUserCredentials('Takis');
}

const userData = userStore.userData;
</script>