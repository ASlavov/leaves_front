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
        <div class="grid grid-cols-12 pt-[10px] max-w-[947px]">
          <div class="grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]">
            <div v-if="!entitlementId" class="max-w-[97%] col-span-2">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î•ÏÎ³Î±Î¶ÏŒÎ¼ÎµÎ½Î¿Î¹</label>
              <CustomMultiSelect
                  v-model="formUserIds"
                  :options="users"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ ÎµÏÎ³Î±Î¶ÏŒÎ¼ÎµÎ½Î¿/Î¿Ï…Ï‚"
              />
            </div>
            <div class="max-w-sm">
              <CustomSelect
                  v-model="formLeaveTypeId"
                  :options="leaveTypes"
                  label="Î•Î¯Î´Î¿Ï‚ Î†Î´ÎµÎ¹Î±Ï‚"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ ÎµÎ¯Î´Î¿Ï‚ Î¬Î´ÎµÎ¹Î±Ï‚"
                  selectId="leave-type-select"
              />
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white ">
                Î”Î¹ÎºÎ±Î¹Î¿ÏÎ¼ÎµÎ½ÎµÏ‚ Î—Î¼Î­ÏÎµÏ‚
                <span class="inline-block ml-1 align-middle cursor-pointer relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>

                  <div class="absolute z-10 top-0 left-1/2 -translate-y-full -translate-x-1/2 w-48 p-4 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 border-[1px] border-gray-700 dark:border-gray-500 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-neutral-800">
                    Î‘Î½ Î¿ Ï‡ÏÎ®ÏƒÏ„Î·Ï‚ Î­Ï‡ÎµÎ¹ Î®Î´Î· ÎºÎ±Ï„Î±Ï‡Ï‰ÏÎ·Î¼Î­Î½ÎµÏ‚ Î´Î¹ÎºÎ±Î¹Î¿ÏÎ¼ÎµÎ½ÎµÏ‚ Î·Î¼Î­ÏÎµÏ‚ Î³Î¹Î± Î±Ï…Ï„ÏŒ Ï„Î¿ Î­Ï„Î¿Ï‚, Î¿Î¹ Î·Î¼Î­ÏÎµÏ‚ Î±Ï…Ï„Î­Ï‚ Î¸Î± Î±Î½Ï„Î¹ÎºÎ±Ï„Î±ÏƒÏ„Î±Î¸Î¿ÏÎ½.
                  </div>
                </span>
              </label>
              <input v-model.number="formEntitledDays" type="number" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Î‘ÏÎ¹Î¸Î¼ÏŒÏ‚ Î·Î¼ÎµÏÏŽÎ½">
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î—Î¼ÎµÏÎ¿Î¼Î·Î½Î¯Î± Î­Î½Î±ÏÎ¾Î·Ï‚</label>
              <input
                  type="text"
                  ref="datePickerStart"
                  v-model="formStartDate"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ Î·Î¼/Î½Î¹Î±"
                  class="cursor-pointer py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Î—Î¼ÎµÏÎ¿Î¼Î·Î½Î¯Î± Î»Î®Î¾Î·Ï‚</label>
              <input
                  type="text"
                  ref="datePickerEnd"
                  v-model="formEndDate"
                  placeholder="Î•Ï€Î¹Î»Î­Î¾Ï„Îµ Î·Î¼/Î½Î¹Î±"
                  class="cursor-pointer py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
            </div>
            <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
              <button @click="submitForm"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                {{ entitlementId ? 'Î‘Ï€Î¿Î¸Î®ÎºÎµÏ…ÏƒÎ· Î‘Î»Î»Î±Î³ÏŽÎ½' : 'Î ÏÎ¿ÏƒÎ¸Î®ÎºÎ· Î†Î´ÎµÎ¹Î±Ï‚' }}
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
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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

// Reactive variables for form fields
const formUserIds = ref([]); // <-- Now an array
const formLeaveTypeId = ref(null);
const formEntitledDays = ref(0);
const formStartDate = ref('');
const formEndDate = ref('');

const loading = ref(false);

// Lists for CustomSelect components
const users = computed(() => userStore.allUsers.map(user => ({
  id: user.id,
  name: user.name,
  icon: user.profile?.profile_image_base64 ? `<img src="${user.profile.profile_image_base64}" class="rounded-full size-6 object-cover" />` : `<div class="bg-gray-300 rounded-full size-6 flex items-center justify-center text-white font-bold">${user.name.charAt(0)}</div>`,
  description: user.profile?.job_title,
})));
const leaveTypes = computed(() => leavesStore.leavesData.leavesTypes.map(type => ({ id: type.id, name: type.name })));

const datePickerStart = ref(null);
const datePickerEnd = ref(null);

onMounted(async () => {
  loading.value = true;

  if (typeof window !== 'undefined') {
    const today = new Date();
    //silly trick. getFullYear returns integer. new Date(integer) means timestamp
    const thisYear = new Date('' + today.getFullYear());

    // Initialize the start date picker
    flatpickr(datePickerStart.value, {
      dateFormat: "Y-m-d",
      minDate: thisYear, // Disable past dates
      default: today,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const insideStartDate = new Date(selectedDates[0]);
          formStartDate.value = insideStartDate.value;

          // Set the end date to one day after the start date
          const minEndDate = new Date(insideStartDate);
          minEndDate.setDate(minEndDate.getDate());

          // Update the end date picker
          flatpickr(datePickerEnd.value, {
            dateFormat: "Y-m-d",
            defaultDate: minEndDate,
            minDate: minEndDate // Disable dates before one day after the start date
          });
        }
      }
    });

    flatpickr(datePickerEnd.value, {
      dateFormat: "Y-m-d",
      minDate: thisYear // Disable past dates initially
    });
  }

  if (props.entitlementId) {
    const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers).flatMap(Object.values).flat();
    const entitlementToEdit = allEntitlements.find(e => e.id == props.entitlementId);

    if (entitlementToEdit) {
      formUserIds.value = [entitlementToEdit.user_id]; // <-- Pre-fill with a single-item array
      formLeaveTypeId.value = entitlementToEdit.leave_type_id;
      formEntitledDays.value = entitlementToEdit.entitled_days;
      formStartDate.value = entitlementToEdit.start_from;
      formEndDate.value = entitlementToEdit.end_to;
    }
    //console.log(entitlementToEdit);
  }
  loading.value = false;
});

const submitForm = async () => {
  if (!formUserIds.value.length || !formLeaveTypeId.value || !formEntitledDays.value || !formStartDate.value || !formEndDate.value) {
    $toast.error('Î Î±ÏÎ±ÎºÎ±Î»ÏŽ ÏƒÏ…Î¼Ï€Î»Î·ÏÏŽÏƒÏ„Îµ ÏŒÎ»Î± Ï„Î± Ï€ÎµÎ´Î¯Î±!', { position: "bottom-right", autoClose: 5000 });
    return;
  }

  try {
    if (props.entitlementId) {
      // Logic for editing a single entitlement
      await entitlementStore.updateEntitledDaysForUser(
          props.entitlementId,
          formUserIds.value[0], // Use the first user ID
          parseInt(formLeaveTypeId.value),
          formEntitledDays.value,
          formStartDate.value,
          formEndDate.value
      );
      $toast.success('Î— Î¬Î´ÎµÎ¹Î± ÎµÎ½Î·Î¼ÎµÏÏŽÎ¸Î·ÎºÎµ ÎµÏ€Î¹Ï„Ï…Ï‡ÏŽÏ‚!', { position: "bottom-right", autoClose: 5000 });
    } else {
      // Logic for adding one or more new entitlements
      await entitlementStore.addEntitledDays(
          formUserIds.value,
          parseInt(formLeaveTypeId.value),
          formEntitledDays.value,
          formStartDate.value,
          formEndDate.value
      );
      $toast.success('Î— Î½Î­Î± Î¬Î´ÎµÎ¹Î±/ÎµÏ‚ Ï€ÏÎ¿ÏƒÏ„Î­Î¸Î·ÎºÎµ/Î±Î½ ÎµÏ€Î¹Ï„Ï…Ï‡ÏŽÏ‚!', { position: "bottom-right", autoClose: 5000 });
    }
  } catch (error) {
    $toast.error('Î£Ï†Î¬Î»Î¼Î± ÎºÎ±Ï„Î¬ Ï„Î·Î½ Î±Ï€Î¿Î¸Î®ÎºÎµÏ…ÏƒÎ· Ï„Î·Ï‚ Î¬Î´ÎµÎ¹Î±Ï‚.', { position: "bottom-right", autoClose: 5000 });
  }
};
</script>