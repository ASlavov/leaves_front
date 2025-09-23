<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Άναθεση αδειών σε χρήστες</h2>
    <form @submit.prevent="submitForm">
      <!-- Leave Type Select -->
      <CustomSelect
          :options="leaveTypes"
          v-model="formData.leaveTypeId"
          label="Τύπος Άδειας"
          placeholder="Επιλέξτε τύπο άδειας"
          selectId="leave-type-select"
      />

      <!-- Entitled Days Input -->
      <div class="mt-4">
        <label for="entitledDays" class="block text-sm font-bold mb-2 text-black dark:text-white">Ήμερες που δικαιούται</label>
        <input
            id="entitledDays"
            type="number"
            v-model.number="formData.entitledDays"
            class="py-3 px-4 w-full border border-gray-200 rounded-lg bg-white text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
            min="1"
            required
        />
      </div>

      <!-- Selection Type Switch -->
      <div class="mt-4 grid grid-cols-2">
        <span class="block text-sm font-bold mb-2 text-black dark:text-white col-span-2">Ανάθεση σε:</span>
        <div class="flex items-center ml-4">
          <span class="mr-2 text-black dark:text-white">Χρήστες</span>
          <!-- Toggle Button -->
          <button
              @click="toggleSelectionType"
              type="button"
              :class="[
                'relative inline-flex items-center h-6 w-11 rounded-full focus:outline-none',
                selectionType === 'departments' ? 'bg-red-600' : 'bg-gray-200 dark:bg-neutral-400',
              ]"
          >
            <span
                :class="[
                  'inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out',
                  selectionType === 'departments' ? 'translate-x-5' : 'translate-x-1',
                ]"
            ></span>
          </button>
          <span class="ml-2 text-black dark:text-white">Γκρουπ</span>
        </div>


      <!-- Users MultiSelect -->
      <div v-if="selectionType === 'users'" class="contents">
        <!-- Add All and Clear All buttons -->
        <div class="flex items-center justify-end space-x-2 mb-2 col-span-1 text-red-500 font-bold">
          <button @click="selectAllUsers" type="button" class="underline border-r border-r-neutral-500 pr-[10px]">+ Προσθήκη όλων</button>
          <button @click="clearAllUsers" type="button" class="underline">&times; Αποεπιλογή όλων</button>
        </div>
        <div class="col-span-2">
          <CustomMultiSelect
              :options="users"
              v-model="formData.selectedUsers"
              placeholder="Επιλέξτε Χρήστες"
          />
        </div>
      </div>

      <!-- Departments MultiSelect -->
      <div v-if="selectionType === 'departments'" class="contents">
        <!-- Add All and Clear All buttons -->
        <div class="flex items-center justify-end space-x-2 mb-2 col-span-1 text-red-500 font-bold">
          <button @click="selectAllDepartments" type="button" class="underline border-r border-r-neutral-500 pr-[10px]">+ Προσθήκη όλων</button>
          <button @click="clearAllDepartments" type="button" class="underline">&times; Αποεπιλογή όλων</button>
        </div>
        <div class="col-span-2">
          <CustomMultiSelect
              :options="departments"
              v-model="formData.selectedDepartments"
              placeholder="Επιλέξτε Γκρουπ"
          />
        </div>
      </div>

      </div>
      <!-- Submit Button -->
      <div class="mt-6">
        <button
            type="submit"
            class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
        >
          Ανάθεση άδειας
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';

// Access centralStore and individual stores
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

// Reactive data for the form
const formData = ref({
  leaveTypeId: '',            // Selected leave type ID
  selectedUsers: [],          // Array of selected user IDs
  selectedDepartments: [],    // Array of selected department IDs
  entitledDays: '',           // Number of entitled days
});

const selectionType = ref('users'); // 'users' or 'departments'
const toggleSelectionType = () => {
  selectionType.value = selectionType.value === 'users' ? 'departments' : 'users';
};
// Computed options for the CustomSelect and CustomMultiSelect components
const leaveTypes = computed(() =>
    leavesStore.leavesData.leavesTypes.map((leaveType) => ({
      id: leaveType.id,
      name: leaveType.name,
    }))
);

const users = computed(() =>
    userStore.allUsers.map((user) => ({
      id: user.id,
      name: user.name,
    }))
);

const departments = computed(() =>
    departmentsStore.departmentsData.map((department) => ({
      id: department.id,
      name: department.name,
    }))
);

// Form submission handler
const submitForm = () => {
  // Validate inputs
  if (!formData.value.leaveTypeId) {
    alert('Please select a leave type.');
    return;
  }
  if (!formData.value.entitledDays || formData.value.entitledDays <= 0) {
    alert('Please enter a valid number of entitled days.');
    return;
  }
  if (selectionType.value === 'users' && formData.value.selectedUsers.length === 0) {
    alert('Please select at least one user.');
    return;
  }
  if (selectionType.value === 'departments' && formData.value.selectedDepartments.length === 0) {
    alert('Please select at least one department.');
    return;
  }

  // Prepare data for API call
  const payload = {
    leaveTypeId: formData.value.leaveTypeId,
    entitledDays: formData.value.entitledDays,
  };
  if (selectionType.value === 'users') {
    payload.userIds = formData.value.selectedUsers;
  } else {
    payload.departmentIds = formData.value.selectedDepartments;
  }

  // Call the store action to assign entitlements
  /*leavesStore
      .assignEntitlements(payload)
      .then(() => {
        alert('Leave entitlements assigned successfully.');
        // Reset form
        formData.value.leaveTypeId = '';
        formData.value.selectedUsers = [];
        formData.value.selectedDepartments = [];
        formData.value.entitledDays = '';
        selectionType.value = 'users';
      })
      .catch((error) => {
        alert('An error occurred: ' + error.message);
      });*/

  //console.log(payload);
};

// Add these methods inside your <script setup>

const selectAllUsers = () => {
  formData.value.selectedUsers = users.value.map(user => user.id);
};

const clearAllUsers = () => {
  formData.value.selectedUsers = [];
};

const selectAllDepartments = () => {
  formData.value.selectedDepartments = departments.value.map(department => department.id);
};

const clearAllDepartments = () => {
  formData.value.selectedDepartments = [];
};


</script>

<style scoped>
/* Add any additional styles if needed */
</style>
