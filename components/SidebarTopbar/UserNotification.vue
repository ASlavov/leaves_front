<template>
    <div class="relative" ref="dropdownContainer">
        <button 
            type="button"
            class="size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            @click="toggleNotifications">
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <span class="sr-only">Notifications</span>
        </button>

        <div v-if="showNotifications" class="fixed top-[60px] right-0 h-full w-80 bg-white border border-gray-200 shadow-lg dark:bg-neutral-800 dark:border-neutral-600 overflow-y-auto">
            <!-- Tabs for Unread and Read -->
            <div class="flex justify-around py-2 border-b dark:border-neutral-600">
                <button :class="{'font-semibold': activeTab === 'unread'}" @click="setTab('unread')">
                    Unread
                </button>
                <button :class="{'font-semibold': activeTab === 'read'}" @click="setTab('read')">
                    Read
                </button>
            </div>

            <!-- Notification List -->
            <ul class="divide-y divide-gray-200 dark:divide-neutral-600">
                <li v-for="notification in filteredNotifications" :key="notification.id" class="p-4 text-sm text-gray-700 dark:text-gray-300">
                    <div class="notification-title font-semibold">{{ notification.title }}</div>
                    <div class="notification-message mt-1">{{ notification.message }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';

const router = useRouter();
const { notificationsStore } = useCentralStore();

// Notifications and Tab Management
const notifications = computed(() => notificationsStore.notificationsData);
const showNotifications = ref(false);
const dropdownContainer = ref(null);
const activeTab = ref('unread');

// Toggle notifications visibility
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
};

// Handle click outside to close the dropdown
const handleClickOutside = (event) => {
    if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
        showNotifications.value = false;
    }
};

// Filter notifications based on active tab (Unread/Read)
const filteredNotifications = computed(() => {
    if (activeTab.value === 'unread') {
        return notifications.value.filter(notification => notification.is_read === 0);
    } else {
        return notifications.value.filter(notification => notification.is_read === 1);
    }
});

// Switch between tabs
const setTab = (tab) => {
    activeTab.value = tab;
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(showNotifications, (newVal) => {
    if (newVal) {
        document.addEventListener('click', handleClickOutside);
    } else {
        document.removeEventListener('click', handleClickOutside);
    }
});
</script>

<script>
export default {
    name: 'UserNotification',
};
</script>
