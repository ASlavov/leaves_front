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
        <textarea
            class="resize-none py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200 dark:bg-neutral-800 dark:text-gray-100"
            type="text"
            rows="1"
            :placeholder="$t('common.searchUser')"
            v-model="searchQuery"
            autocomplete="off"
            @keydown.enter.prevent
            @focus="showDropdownVar = true"
        />
      </div>

      <!-- SearchBox Dropdown -->
      <div class="absolute z-50 w-full bg-white border border-gray-200 mt-2 rounded-lg shadow-xl dark:bg-neutral-800 dark:border-neutral-700" v-show="showDropdown">
        <div class="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto">
          <div v-for="(items, category) in groupedResults" :key="category">
            <!-- Category heading -->
            <div
                class="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200 font-semibold text-xs uppercase"
            >
              {{ category }}
            </div>
            <!-- Loop through items in the category -->
            <div
                v-for="item in items"
                :key="item.id"
                class="flex items-center cursor-pointer py-3 px-4 w-full text-sm text-gray-800 hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 transition-colors"
                @click="openModal(item)"
            >
              <div class="font-medium">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- End SearchBox Dropdown -->
    </div>

    <!-- Modal -->
    <div
        v-if="showModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal"
    >
      <div class="bg-white dark:bg-neutral-800 dark:text-white p-8 rounded-xl w-full max-w-md relative shadow-2xl border dark:border-neutral-700">
        <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <svg class="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
        
        <h2 class="text-xl font-bold mb-6 border-b pb-4 dark:border-neutral-700">{{ $t('common.userInfo') }}</h2>

        <!-- User Info -->
        <div class="space-y-4">
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.firstName') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ firstName }}</span>
          </div>
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.lastName') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ lastName }}</span>
          </div>
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.title') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ selectedUser?.profile?.job_title }}</span>
          </div>
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.email') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ selectedUser?.email }}</span>
          </div>
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.phone') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ selectedUser?.profile?.phone }}</span>
          </div>
          <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('common.internalPhone') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ selectedUser?.profile?.internal_phone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{ $t('settings.group') }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-medium">{{ selectedUser?.department?.name }}</span>
          </div>
        </div>

        <!-- Next / Previous buttons -->
        <div v-if="hasMultipleUsers" class="mt-8 flex justify-between border-t dark:border-neutral-700 pt-6">
          <button
              @click="previousUser"
              class="flex items-center justify-center size-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-30"
              :disabled="!hasPrevious"
          >
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
              @click="nextUser"
              class="flex items-center justify-center size-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-30"
              :disabled="!hasNext"
          >
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
const showDropdown = computed(() => showDropdownVar.value && (searchQuery.value !== '' || items.value.length > 0));

// Filtered results based on search query
const filteredResults = computed(() => {
  if (searchQuery.value === '') {
    return items.value;
  }
  return items.value.filter(
      (item) =>
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.department?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
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
  showDropdownVar.value = false;
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
  const modal = document.querySelector('.fixed.z-\\[100\\]');
  const dropdown = document.querySelector('.absolute.z-50');
  
  // Close dropdown if clicking outside it
  if (dropdown && !dropdown.contains(event.target) && !event.target.closest('textarea')) {
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


<style scoped>
/* Custom scrollbar for dropdown */
.absolute.z-50 ::-webkit-scrollbar {
  width: 6px;
}
.absolute.z-50 ::-webkit-scrollbar-track {
  background: transparent;
}
.absolute.z-50 ::-webkit-scrollbar-thumb {
  @apply bg-gray-200 dark:bg-neutral-700 rounded-full;
}
</style>
