<template>
  <div class="flex items-center justify-center shrink-0 size-[38px] rounded-full overflow-hidden dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-300 focus:outline-none">
  <button
    @click="toggleLanguage"
    class="flex items-center justify-center shrink-0 size-[24px] rounded-full overflow-hidden border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-300 focus:outline-none"
    :title="currentLocale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'"
  >
    <img
      v-if="currentLocale === 'el'"
      src="https://flagcdn.com/w80/gr.png"
      alt="Greek"
      class="object-cover size-full"
    />
    <img
      v-else
      src="https://flagcdn.com/w80/gb.png"
      alt="English"
      class="object-cover size-full"
    />
  </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const { locale, setLocale } = useI18n();

const currentLocale = computed(() => locale.value);

const toggleLanguage = () => {
  const nextLocale = currentLocale.value === 'el' ? 'en' : 'el';
  setLocale(nextLocale);
};
</script>
