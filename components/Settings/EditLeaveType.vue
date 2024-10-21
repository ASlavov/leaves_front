<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">

        <!-- Loading Skeletons -->
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
          <!-- Info Details Skeleton -->
          <div class="pt-4 space-y-2 col-span-10 animate-pulse">
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <!-- Info Details -->
          <div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]">
            <!-- Leave Name -->
            <div class="w-full">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Όνομα Γκρουπ</label>
              <input v-model="leaveTypeName" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Όνομα τύπου άδειας">
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { useCentralStore } from "~/stores/centralStore.js";
import {computed, onMounted, watch} from "vue";

const centralStore = useCentralStore();
const loading = computed(() => centralStore.loading);

const leaveTypeName = ref('');

const props = defineProps({
  leaveTypeId: {
    type: [Number, String],
    required: false,
  },
});
// Watch for changes in userId
watch(
    () => props.leaveTypeId,
    () => {
      if (centralStore.initialized && props.leaveTypeId) {
        leaveTypeName.value = centralStore.leavesStore.leavesData?.leavesTypes?.filter(leaveType => leaveType?.id === props?.leaveTypeId)[0]?.name || '';
      }
    }
);

</script>