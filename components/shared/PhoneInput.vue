<template>
  <div class="w-full">
    <label v-if="label" :class="labelClass" v-html="label"></label>

    <div
      class="flex h-[40px] rounded-[8px] border border-[#DFEAF2] bg-white text-[14px] text-black transition-all hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100 dark:hover:border-neutral-400"
    >
      <!-- Country picker -->
      <div ref="dropdownRef" class="relative flex-shrink-0">
        <button
          type="button"
          class="flex items-center gap-[6px] h-full px-[10px] border-r border-[#DFEAF2] dark:border-neutral-600 rounded-l-[8px] hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none transition-colors"
          @click="dropdownOpen = !dropdownOpen"
        >
          <img
            :src="flagUrl(selectedCountry.iso2)"
            :alt="selectedCountry.iso2"
            class="w-[18px] h-[18px] rounded-full object-cover flex-shrink-0"
          />
          <span class="text-[13px] text-gray-500 dark:text-neutral-400 font-medium"
            >+{{ selectedCountry.dialCode }}</span
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :class="[
              'w-3 h-3 text-gray-400 dark:text-neutral-500 transition-transform duration-150',
              dropdownOpen ? 'rotate-180' : '',
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="dropdownOpen"
          class="absolute top-[calc(100%+4px)] left-0 z-[200] w-[280px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[8px] shadow-2xl overflow-hidden"
        >
          <!-- Search -->
          <div class="p-[8px] border-b border-gray-100 dark:border-neutral-700">
            <input
              ref="searchRef"
              v-model="search"
              type="text"
              :placeholder="$t('common.searchCountry')"
              class="w-full px-[10px] py-[6px] text-[13px] rounded-[6px] border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keydown.stop
            />
          </div>
          <!-- Options -->
          <ul
            class="max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
          >
            <li
              v-for="c in filteredCountries"
              :key="c.iso2"
              class="flex items-center gap-[8px] px-[12px] py-[8px] cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 text-[13px] transition-colors"
              :class="c.iso2 === selectedCountry.iso2 ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
              @click="selectCountry(c)"
            >
              <img
                :src="flagUrl(c.iso2)"
                :alt="c.iso2"
                class="w-[18px] h-[18px] rounded-full object-cover flex-shrink-0"
              />
              <span class="flex-1 truncate text-gray-800 dark:text-gray-200">{{ c.name }}</span>
              <span class="flex-shrink-0 text-gray-400 dark:text-neutral-500 font-medium"
                >+{{ c.dialCode }}</span
              >
            </li>
            <li
              v-if="!filteredCountries.length"
              class="px-[12px] py-[10px] text-[13px] text-gray-400 dark:text-neutral-500 text-center"
            >
              No countries found
            </li>
          </ul>
        </div>
      </div>

      <!-- Number input -->
      <input
        ref="inputRef"
        v-model="localNumber"
        type="tel"
        :class="telephoneClass"
        :placeholder="placeholder"
        autocomplete="tel"
        class="flex-1 min-w-0 bg-transparent px-[12px] text-[14px] focus:outline-none rounded-r-[8px]"
        @input="emitValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useFormStyles } from '@/composables/useFormStyles';
import { onClickOutside } from '@vueuse/core';
import { type Country, flagUrl, COUNTRIES, findByIso2 } from '@/utils/countryData';

// ─── Props / emits ────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  initialCountry: { type: String, default: 'gr' },
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'valid', valid: boolean): void;
}>();

// ─── Form styles ──────────────────────────────────────────────────────────────
const { telephone: telephoneClass, label: labelClass } = useFormStyles();

// ─── State ────────────────────────────────────────────────────────────────────
const dropdownOpen = ref(false);
const search = ref('');
const searchRef = ref<HTMLInputElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const selectedCountry = ref<Country>(findByIso2(props.initialCountry));
const localNumber = ref('');

// ─── Parse incoming modelValue ────────────────────────────────────────────────
function parseModelValue(v: string) {
  if (!v) {
    localNumber.value = '';
    return;
  }
  if (v.startsWith('+')) {
    // Try to match a known dial code (longest first to avoid prefix collisions)
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      const prefix = `+${c.dialCode}`;
      if (v.startsWith(prefix)) {
        selectedCountry.value = c;
        localNumber.value = v.slice(prefix.length).trim();
        return;
      }
    }
    localNumber.value = v;
  } else {
    localNumber.value = v;
  }
}

onMounted(() => parseModelValue(props.modelValue));
watch(() => props.modelValue, parseModelValue);

// ─── Countries filter ─────────────────────────────────────────────────────────
const filteredCountries = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.iso2.includes(q),
  );
});

// ─── Actions ──────────────────────────────────────────────────────────────────
// function toggleDropdown() {
//   dropdownOpen.value = !dropdownOpen.value;
//   if (dropdownOpen.value) {
//     search.value = '';
//     nextTick(() => searchRef.value?.focus());
//   }
// }

function selectCountry(c: Country) {
  selectedCountry.value = c;
  dropdownOpen.value = false;
  emitValue();
  nextTick(() => inputRef.value?.focus());
}

function emitValue() {
  const raw = (localNumber.value || '').trim();
  if (!raw) {
    emit('update:modelValue', '');
    emit('valid', false);
    return;
  }
  const e164 = `+${selectedCountry.value.dialCode}${raw.replace(/^0+/, '')}`;
  emit('update:modelValue', e164);
  emit('valid', raw.length >= 6);
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false;
});
</script>
