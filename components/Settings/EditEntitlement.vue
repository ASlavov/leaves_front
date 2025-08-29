<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
          <div class="pt-4 space-y-2 col-span-10 animate-pulse">
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]">
            <div v-if="!entitlementId" class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Εργαζόμενοι</label>
              <CustomMultiSelect
                  v-model="formUserIds"
                  :options="users"
                  placeholder="Επιλέξτε εργαζόμενο/ους"
              />
            </div>
            <div class="max-w-sm">
              <CustomSelect
                  v-model="formLeaveTypeId"
                  :options="leaveTypes"
                  label="Είδος Άδειας"
                  placeholder="Επιλέξτε είδος άδειας"
                  selectId="leave-type-select"
              />
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Δικαιούμενες Ημέρες</label>
              <input v-model.number="formEntitledDays" type="number" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Αριθμός ημερών">
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Ημερομηνία έναρξης</label>
              <input v-model="formStartDate" type="date" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
            </div>
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Ημερομηνία λήξης</label>
              <input v-model="formEndDate" type="date" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
            </div>
            <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
              <button @click="submitForm"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                {{ entitlementId ? 'Αποθήκευση Αλλαγών' : 'Προσθήκη Άδειας' }}
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
import { useCentralStore } from '@/stores/centralStore.js';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue'; // <-- New import

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

onMounted(async () => {
  loading.value = true;

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
  }
  loading.value = false;
});

const submitForm = async () => {
  if (!formUserIds.value.length || !formLeaveTypeId.value || !formEntitledDays.value || !formStartDate.value || !formEndDate.value) {
    $toast.error('Παρακαλώ συμπληρώστε όλα τα πεδία!', { position: "bottom-right", autoClose: 5000 });
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
      $toast.success('Η άδεια ενημερώθηκε επιτυχώς!', { position: "bottom-right", autoClose: 5000 });
    } else {
      // Logic for adding one or more new entitlements
      await entitlementStore.addEntitledDays(
          formUserIds.value,
          parseInt(formLeaveTypeId.value),
          formEntitledDays.value,
          formStartDate.value,
          formEndDate.value
      );
      $toast.success('Η νέα άδεια/ες προστέθηκε/αν επιτυχώς!', { position: "bottom-right", autoClose: 5000 });
    }
  } catch (error) {
    $toast.error('Σφάλμα κατά την αποθήκευση της άδειας.', { position: "bottom-right", autoClose: 5000 });
  }
};
</script>