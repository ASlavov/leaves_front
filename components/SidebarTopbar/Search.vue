<template>
  <div class="relative w-full max-w-[600px] md:ml-auto">
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
          v-model="searchQuery"
          class="resize-none py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200 dark:bg-neutral-800 dark:text-gray-100"
          type="text"
          rows="1"
          :placeholder="$t('common.searchUser')"
          autocomplete="off"
          @keydown.enter.prevent
          @focus="showDropdownVar = true"
        />
      </div>

      <!-- SearchBox Dropdown -->
      <div
        v-show="showDropdown"
        class="absolute z-50 w-full bg-white border border-gray-200 mt-2 rounded-lg shadow-xl dark:bg-neutral-800 dark:border-neutral-700"
      >
        <div class="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto">
          <div v-for="(searchItems, category) in groupedResults" :key="category">
            <!-- Category heading -->
            <div
              class="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200 font-semibold text-xs uppercase"
            >
              {{ category }}
            </div>
            <!-- Loop through items in the category -->
            <div
              v-for="item in searchItems"
              :key="item.id"
              class="flex items-center justify-between cursor-pointer py-3 px-4 w-full text-sm text-gray-800 hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 transition-colors"
              @click="openModal(item)"
            >
              <div class="font-medium">{{ item.name }}</div>
              <button
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6264A7] hover:bg-[#464775] text-white text-xs font-bold transition-all shadow-sm shrink-0"
                @click.stop="openTeams(item.email)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{{ $t('common.messagePerson') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- End SearchBox Dropdown -->
    </div>

    <!-- Modal -->
    <SharedUserInfoModal
      v-if="showModal"
      :user="selectedUser"
      :users="filteredResults"
      :current-index="currentIndex"
      @close="closeModal"
      @prev="previousUser"
      @next="nextUser"
    />
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
  { immediate: true },
);

// Show dropdown
const showDropdown = computed(
  () => showDropdownVar.value && (searchQuery.value !== '' || items.value.length > 0),
);

// Filtered results based on search query
const filteredResults = computed(() => {
  if (searchQuery.value === '') {
    return items.value;
  }
  return items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.department?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
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
