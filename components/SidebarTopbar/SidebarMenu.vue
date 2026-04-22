<template>
  <div
    class="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
  >
    <nav class="p-3 w-full flex flex-col flex-wrap">
      <ul class="flex flex-col space-y-3">
        <li>
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/home"
            @click="$emit('navigate')"
          >
            <svg
              class=""
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {{ $t('common.profile') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/calendar"
            @click="$emit('navigate')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ $t('common.calendar') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/org-chart"
            @click="$emit('navigate')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="16" y="14" width="6" height="6" rx="1" ry="1"></rect>
              <rect x="9" y="4" width="6" height="6" rx="1" ry="1"></rect>
              <rect x="2" y="14" width="6" height="6" rx="1" ry="1"></rect>
              <path d="M12 10v2" />
              <path d="M5 14v-1a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1" />
            </svg>
            {{ $t('common.orgChart') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/documents"
            @click="$emit('navigate')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {{ $t('common.documents') }}
          </NuxtLink>
        </li>
        <li v-if="permissionsStore.can('reports', 'view')">
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/reports"
            @click="$emit('navigate')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 6-10" />
            </svg>
            {{ $t('common.reports') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
            to="/settings"
            @click="$emit('navigate')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                stroke="#fff"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                stroke="#fff"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458-1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z"
              />
            </svg>
            {{ $t('common.settings') }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { useCentralStore } from '@/stores/centralStore';
defineEmits(['navigate']);
const { permissionsStore } = useCentralStore();
</script>

<script>
export default {
  name: 'SidebarMenu',
};
</script>
