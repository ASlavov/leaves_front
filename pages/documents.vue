<template>
  <div>
    <Sidebar />
    <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh duration-300">
      <div class="flex justify-between items-center px-4 pt-9 sm:px-6">
        <h3 class="font-semibold text-lg dark:text-gray-100">
          {{ $t('documents.title') }}
        </h3>
      </div>
      <div class="p-4 sm:p-6">
        <DocumentsList />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue';
import DocumentsList from '~/components/Documents/DocumentsList.vue';
</script>
