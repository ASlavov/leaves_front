<template>
  <div class="relative w-full max-w-[600px] ms-auto">
    <!-- SearchBox -->
    <div class="relative">
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
          <svg
              class="shrink-0 size-4 text-gray-400 dark:text-white/60"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
        <input
            class="py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200 dark:bg-neutral-800 dark:text-gray-100"
            type="text"
            role="combobox"
            aria-expanded="true"
            placeholder="Αναζήτηση χρήστη..."
            v-model="searchQuery"
            autocomplete="off"
            @focus="showDropdownVar = true"
        />
      </div>

      <!-- SearchBox Dropdown -->
      <div class="absolute z-50 w-full bg-white border border-gray-200 mt-2" v-show="showDropdown">
        <div class="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto">
          <div v-for="(items, category) in groupedResults" :key="category">
            <!-- Category heading -->
            <div
                class="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200 font-semibold"
            >
              {{ category }}
            </div>
            <!-- Loop through items in the category -->
            <div
                v-for="item in items"
                :key="item.id"
                class="flex items-center cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
                @click="openModal(item)"
            >
              <div>{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- End SearchBox Dropdown -->
    </div>

    <!-- Modal -->
    <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        <h2 class="text-lg font-bold mb-4">Πληροφορίες χρήστη</h2>

        <!-- User Profile Image -->
        <!-- <img :src="selectedUser.profile_image || 'default-profile-image.jpg'" :alt="selectedUser?.name"
              class="rounded-full bg-gray-200 w-24 h-24 mb-4"> -->

        <!-- User Info -->
        <div class="pt-4 space-y-2">
          <div>
            <span class="font-bold">Όνομα: </span
            ><span class="text-gray-500">{{ firstName }}</span>
          </div>
          <div>
            <span class="font-bold">Επώνυμο: </span
            ><span class="text-gray-500">{{ lastName }}</span>
          </div>
          <div>
            <span class="font-bold">Τίτλος: </span
            ><span class="text-gray-500">{{ selectedUser?.profile?.job_title }}</span>
          </div>
          <div>
            <span class="font-bold">Email: </span
            ><span class="text-gray-500">{{ selectedUser?.email }}</span>
          </div>
          <div>
            <span class="font-bold">Κινητό: </span
            ><span class="text-gray-500">{{ selectedUser?.profile?.phone }}</span>
          </div>
          <div>
            <span class="font-bold">Εσωτ. Τηλέφωνο: </span
            ><span class="text-gray-500">{{ selectedUser?.profile?.internal_phone }}</span>
          </div>
          <div>
            <span class="font-bold">Γκρουπ: </span
            ><span class="text-gray-500">{{ selectedUser?.department?.name }}</span>
          </div>
        </div>

        <!-- Next / Previous buttons -->
        <div v-if="hasMultipleUsers" class="mt-4 flex justify-between">
          <button
              @click="previousUser"
              class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              :disabled="!hasPrevious"
          >
            &#8592;
          </button>
          <button
              @click="nextUser"
              class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              :disabled="!hasNext"
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
    <!-- End Modal -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const searchQuery = ref('');
const showModal = ref(false);
const showDropdownVar = ref(false);
const selectedUser = ref(null);
const currentIndex = ref(0);

const centralStore = useCentralStore();
const userStore = centralStore.userStore;

// Reactive reference to all users
const allUsers = computed(() => userStore.allUsers || []);

// Reactive items array synchronized with allUsers
const items = ref([]);

// Watch allUsers and update items
watch(
    allUsers,
    (newVal) => {
      items.value = newVal;
    },
    { immediate: true }
);

// Show dropdown
const showDropdown = computed(() => showDropdownVar.value);

// Filtered results based on search query
const filteredResults = computed(() => {
  if (searchQuery.value === '') {
    return items.value;
  }
  return items.value.filter(
      (item) =>
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.department.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Grouped results by department
const groupedResults = computed(() => {
  return filteredResults.value.reduce((acc, item) => {
    const departmentName = item.department?.name || 'Unknown';
    if (!acc[departmentName]) {
      acc[departmentName] = [];
    }
    acc[departmentName].push(item);
    return acc;
  }, {});
});

// Check if there are multiple users
const hasMultipleUsers = computed(() => filteredResults.value.length > 1);

// Check for next and previous users
const hasNext = computed(() => currentIndex.value < filteredResults.value.length - 1);
const hasPrevious = computed(() => currentIndex.value > 0);

// Modal functions
const openModal = (user) => {
  selectedUser.value = user;
  currentIndex.value = filteredResults.value.findIndex((item) => item.id === user.id);
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// Navigation functions
const nextUser = () => {
  if (hasNext.value) {
    currentIndex.value++;
    selectedUser.value = filteredResults.value[currentIndex.value];
  }
};

const previousUser = () => {
  if (hasPrevious.value) {
    currentIndex.value--;
    selectedUser.value = filteredResults.value[currentIndex.value];
  }
};

// Handle clicks outside modal and dropdown
const handleClickOutside = (event) => {
  const modal = document.querySelector('.fixed');
  const dropdown = document.querySelector('.absolute.z-50');
  if (modal && !modal.contains(event.target)) {
    closeModal();
  }
  if (dropdown && !dropdown.contains(event.target)) {
    closeDropdown();
  }
};

const closeDropdown = () => {
  showDropdownVar.value = false;
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// Compute first and last name from selectedUser
const firstName = computed(() => selectedUser.value?.name?.split(' ')[0] || '');
const lastName = computed(() => selectedUser.value?.name?.split(' ').slice(1).join(' ') || '');
</script>


<style>
/* Add any custom modal styles if necessary */
</style>
