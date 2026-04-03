<template>
  <div class="px-6 pt-4" :class="containerClass">
    <NuxtLink
      class="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-none focus:opacity-80 mb-10"
      to="/home"
      aria-label="WHY"
    >
      <img
        :src="`https://whyagency.gr/wp-content/uploads/2023/10/${theme === 'light' ? 'logo_dark' : 'logo'}.png`"
        width="130"
        alt="Logo"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

withDefaults(
  defineProps<{
    containerClass?: string;
  }>(),
  {
    containerClass: '',
  },
);

const theme = computed(() => {
  const { $colorMode } = useNuxtApp() as any;
  return $colorMode?.value || 'light';
});
</script>
