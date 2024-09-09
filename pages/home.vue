<template>
    <Sidebar />
    <!-- Content -->
    <div class="w-full lg:ps-64 bg-red min-h-dvh-64">
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <!-- your content goes here ... -->
            <LeavesMetric />
        </div>
    </div>
    <!-- End Content -->
</template>

<script>
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue'
import LeavesMetric from '~/components/Home/LeavesMetric.vue'
export default {
    components: {
        Sidebar,
        LeavesMetric
    }
}
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 64px);
}
</style>