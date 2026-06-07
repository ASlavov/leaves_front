<template>
  <SidebarTopbarSidebar />
  <!-- Content -->
  <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300">
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- your content goes here ... -->
      <Calendar />
    </div>
  </div>
  <!-- End Content -->
</template>
<script setup lang="ts">
definePageMeta({ middleware: ['auth'] as any, ssr: false });
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>
