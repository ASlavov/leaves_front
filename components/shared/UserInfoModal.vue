<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-neutral-800 dark:text-white p-8 rounded-xl w-full max-w-md relative shadow-2xl border dark:border-neutral-700"
    >
      <button
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        @click="$emit('close')"
      >
        <svg
          class="shrink-0 size-5"
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <h2 class="text-xl font-bold mb-6 border-b pb-4 dark:border-neutral-700">
        {{ $t('common.userInfo') }}
      </h2>

      <div class="space-y-4">
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.firstName')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{ firstName }}</span>
        </div>
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.lastName')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{ lastName }}</span>
        </div>
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.title')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{
            user?.profile?.job_title
          }}</span>
        </div>
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.email')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{ user?.email }}</span>
        </div>
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.phone')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{
            user?.profile?.phone
          }}</span>
        </div>
        <div class="flex justify-between border-b dark:border-neutral-700 pb-2">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('common.internalPhone')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{
            user?.profile?.internal_phone
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold text-gray-400 dark:text-neutral-500 uppercase text-xs">{{
            $t('settings.group')
          }}</span>
          <span class="text-gray-800 dark:text-gray-100 font-medium">{{
            user?.department?.name
          }}</span>
        </div>

        <div class="pt-4 mt-2 border-t dark:border-neutral-700">
          <button
            class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#6264A7] hover:bg-[#464775] text-white font-bold transition-all shadow-md"
            @click.stop="openTeams(user?.email)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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

      <!-- Next / Previous buttons -->
      <div
        v-if="users.length > 1"
        class="mt-8 flex justify-between border-t dark:border-neutral-700 pt-6"
      >
        <button
          class="flex items-center justify-center size-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-30"
          :disabled="currentIndex <= 0"
          @click="$emit('prev')"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center size-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-30"
          :disabled="currentIndex >= users.length - 1"
          @click="$emit('next')"
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  user: { type: Object, required: true },
  users: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
});

defineEmits(['close', 'prev', 'next']);

const firstName = computed(() => props.user?.name?.split(' ')[0] || '');
const lastName = computed(() => props.user?.name?.split(' ').slice(1).join(' ') || '');

const openTeams = (email: string) => {
  if (email) window.open(`https://teams.microsoft.com/l/chat/0/0?users=${email}`, '_blank');
};
</script>
