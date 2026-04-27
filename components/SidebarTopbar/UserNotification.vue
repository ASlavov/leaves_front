<template>
  <div ref="dropdownContainer" class="relative">
    <!-- Unread Badge -->
    <button
      type="button"
      class="size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
      @click="toggleNotifications"
    >
      <svg
        class="shrink-0 size-4"
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
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
      </svg>
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-neutral-800"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
      <span class="sr-only">{{ $t('common.unread') }}</span>
    </button>

    <!-- Notifications Drawer/Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-x-10"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-10"
    >
      <div
        v-if="showNotifications"
        class="fixed top-[60px] right-0 h-[calc(100vh-60px)] w-80 bg-white border-l border-gray-200 shadow-xl dark:bg-neutral-800 dark:border-neutral-700 flex flex-col z-[100]"
      >
        <!-- Header -->
        <div class="p-4 border-b dark:border-neutral-700 flex justify-between items-center">
          <h3 class="text-sm font-semibold dark:text-white">{{ $t('notifications.title') }}</h3>
          <button
            v-if="unreadCount > 0"
            class="text-[10px] uppercase font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            @click="markAllAsRead"
          >
            {{ $t('notifications.markAllRead') }}
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b dark:border-neutral-700">
          <button
            v-for="tab in ['unread', 'read']"
            :key="tab"
            class="flex-1 py-3 text-xs font-medium uppercase transition-colors relative"
            :class="
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400'
            "
            @click="activeTab = tab"
          >
            {{ $t(`common.${tab}`) }}
            <span v-if="tab === 'unread' && unreadCount > 0" class="ml-1">({{ unreadCount }})</span>
            <div
              v-if="activeTab === tab"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
            ></div>
          </button>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <ul
            v-if="currentNotifications.length > 0"
            class="divide-y divide-gray-100 dark:divide-neutral-700"
          >
            <li
              v-for="notification in currentNotifications"
              :key="notification.id"
              class="group p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer relative"
              :class="{ 'bg-primary-50/30 dark:bg-primary-900/10': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex gap-3">
                <!-- Icon based on type -->
                <div class="mt-0.5">
                  <div
                    class="size-8 rounded-full flex items-center justify-center"
                    :class="getTypeIconClass(notification.type)"
                  >
                    <component :is="getTypeIcon(notification.type)" class="size-4" />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {{ notification.title }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {{ notification.message }}
                  </p>
                  <p class="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">
                    {{ formatTime(notification.created_at) }}
                  </p>
                </div>

                <!-- Unread dot -->
                <div
                  v-if="!notification.is_read"
                  class="size-2 bg-primary-500 rounded-full absolute top-4 right-4"
                ></div>
              </div>
            </li>
          </ul>

          <!-- Empty State -->
          <div v-else class="h-full flex flex-col items-center justify-center p-8 text-center">
            <div
              class="size-12 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center mb-4"
            >
              <svg
                class="size-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-neutral-400">
              {{ $t('notifications.empty') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useNotificationsStore } from '~/stores/notifications';
import { useRouter } from 'vue-router';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  InformationCircleIcon as InfoIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const notificationsStore = useNotificationsStore();
const showNotifications = ref(false);
const dropdownContainer = ref(null);
const activeTab = ref('unread');

const unreadCount = computed(() => notificationsStore.unreadCount);
const currentNotifications = computed(() =>
  activeTab.value === 'unread'
    ? notificationsStore.unreadNotifications
    : notificationsStore.readNotifications,
);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const markAllAsRead = async () => {
  await notificationsStore.markAllRead();
};

const handleNotificationClick = async (notification) => {
  // Mark as read if not already
  if (!notification.is_read) {
    await notificationsStore.changeNotificationStatus(notification.id);
  }

  // Deep linking logic
  if (notification.meta?.leave_id || notification.meta?.requesting_user_id) {
    const userId = notification.meta.requesting_user_id;
    // router.push with query param
    router.push({
      path: '/yearly-leaves',
      query: { userId: userId },
    });
    showNotifications.value = false;
  }
};

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(); // Simplification for now
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'leave_approved':
    case 'leave_auto_approved':
      return CheckCircleIcon;
    case 'leave_declined':
    case 'leave_cancelled':
      return XCircleIcon;
    case 'leave_requested':
      return CalendarIcon;
    case 'leave_requested_head_info':
      return InfoIcon;
    default:
      return BellIcon;
  }
};

const getTypeIconClass = (type) => {
  switch (type) {
    case 'leave_approved':
    case 'leave_auto_approved':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'leave_declined':
    case 'leave_cancelled':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'leave_requested':
      return 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400';
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<script>
export default {
  name: 'UserNotification',
};
</script>
