<template>
  <div>
    <Sidebar />
    <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh duration-300">
      <OrgChartPage />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue';
import OrgChartPage from '~/components/OrgChart/OrgChartPage.vue';
</script>
