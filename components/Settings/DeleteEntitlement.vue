<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">
        <div class="grid grid-cols-12 pt-[10px] max-w-[947px]">
          <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
          <div class="pt-4 space-y-2 col-span-10 animate-pulse">
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
          <p class="font-bold">Î•Î¯ÏƒÏ„Îµ ÏƒÎ¯Î³Î¿Ï…ÏÎ¿Î¹ ÏŒÏ„Î¹ Î¸Î­Î»ÎµÏ„Îµ Î½Î± Î´Î¹Î±Î³ÏÎ¬ÏˆÎµÏ„Îµ Î±Ï…Ï„Î®Î½ Ï„Î·Î½ Î¬Î´ÎµÎ¹Î±;</p>
          <p class="text-sm">Î‘Ï…Ï„Î® Î· ÎµÎ½Î­ÏÎ³ÎµÎ¹Î± Î´ÎµÎ½ Î¼Ï€Î¿ÏÎµÎ¯ Î½Î± Î±Î½Î±Î¹ÏÎµÎ¸ÎµÎ¯.</p>
        </div>
        <div class="grid grid-cols-12 pt-[10px] max-w-[947px]">
          <div class="grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]">
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î•ÏÎ³Î±Î¶ÏŒÎ¼ÎµÎ½Î¿Ï‚</label>
              <p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">{{ userName }}</p>
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î•Î¯Î´Î¿Ï‚ Î†Î´ÎµÎ¹Î±Ï‚</label>
              <p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">{{ leaveTypeName }}</p>
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î”Î¹ÎºÎ±Î¹Î¿ÏÎ¼ÎµÎ½ÎµÏ‚ Î—Î¼Î­ÏÎµÏ‚</label>
              <p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">{{ formEntitledDays }}</p>
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î—Î¼ÎµÏÎ¿Î¼Î·Î½Î¯Î± Î­Î½Î±ÏÎ¾Î·Ï‚</label>
              <p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">{{ formStartDate }}</p>
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î—Î¼ÎµÏÎ¿Î¼Î·Î½Î¯Î± Î»Î®Î¾Î·Ï‚</label>
              <p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">{{ formEndDate }}</p>
            </div>
            <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
              <button @click="confirmDelete"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Î”Î¹Î±Î³ÏÎ±Ï†Î® Î†Î´ÎµÎ¹Î±Ï‚
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const entitlementStore = centralStore.entitlementStore;
const leavesStore = centralStore.leavesStore;
const { $toast } = useNuxtApp();

const props = defineProps({
  entitlementId: {
    type: [Number, String, null],
    required: false,
  },
});

const emit = defineEmits(['modal:close']);

// Reactive variables to hold the data for display
const formUserId = ref(null);
const formLeaveTypeId = ref(null);
const formEntitledDays = ref(0);
const formStartDate = ref('');
const formEndDate = ref('');

const loading = ref(true);

const userName = computed(() => {
  const user = userStore.allUsers.find(u => u.id === formUserId.value);
  return user ? user.name : 'Î†Î³Î½Ï‰ÏƒÏ„Î¿Ï‚';
});

const leaveTypeName = computed(() => {
  const type = leavesStore.leavesData.leavesTypes.find(t => t.id === formLeaveTypeId.value);
  return type ? type.name : 'Î†Î³Î½Ï‰ÏƒÏ„Î¿Ï‚';
});

onMounted(async () => {
  if (props.entitlementId) {
    const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers).flatMap(Object.values).flat();
    const entitlementToDelete = allEntitlements.find(e => e.id == props.entitlementId);

    if (entitlementToDelete) {
      formUserId.value = entitlementToDelete.user_id;
      formLeaveTypeId.value = entitlementToDelete.leave_type_id;
      formEntitledDays.value = entitlementToDelete.entitled_days;
      formStartDate.value = entitlementToDelete.start_from;
      formEndDate.value = entitlementToDelete.end_to;
    }
  }
  loading.value = false;
});

const confirmDelete = async () => {
  try {
    await entitlementStore.deleteEntitledDaysForUser(formUserId.value, props.entitlementId);
    $toast.success('Î— Î¬Î´ÎµÎ¹Î± Î´Î¹Î±Î³ÏÎ¬Ï†Ï„Î·ÎºÎµ ÎµÏ€Î¹Ï„Ï…Ï‡ÏŽÏ‚!', { position: "bottom-right", autoClose: 5000 });
    // Emit an event to close the modal
    emit('modal:close');
  } catch (error) {
    $toast.error('Î£Ï†Î¬Î»Î¼Î± ÎºÎ±Ï„Î¬ Ï„Î· Î´Î¹Î±Î³ÏÎ±Ï†Î® Ï„Î·Ï‚ Î¬Î´ÎµÎ¹Î±Ï‚.', { position: "bottom-right", autoClose: 5000 });
  }
};
</script>