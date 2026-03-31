<template>
  <div
    class="rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="src" :src="src" class="w-full h-full object-cover" alt="avatar" />
    <span
      v-else
      class="text-white font-semibold select-none"
      :class="textClass"
      :style="textClass ? {} : { fontSize: `${Math.round(size / 2.8)}px` }"
    >
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

const props = withDefaults(
  defineProps<{
    user: User | null;
    size?: number;
    textClass?: string;
  }>(),
  {
    size: 40,
    textClass: '',
  },
);

const src = computed(() => props.user?.profile?.profile_image_base64 ?? null);

const initials = computed(() => {
  if (!props.user?.name) return '';
  const parts = props.user.name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
});
</script>
