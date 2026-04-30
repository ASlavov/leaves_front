<template>
  <div>
    <!-- Filter row -->
    <div
      class="flex flex-wrap items-center gap-3 pl-5 pr-10 py-2.5 border-b border-gray-100 dark:border-neutral-700"
    >
      <span class="shrink-0 text-sm font-bold text-gray-700 dark:text-gray-200">
        {{ $t('settings.filters') }}
      </span>
      <div class="flex flex-1 flex-wrap gap-2">
        <div
          v-for="field in filterFields"
          :key="field.key"
          class="inline-flex min-w-[130px] border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-600 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500"
        >
          <input
            :value="localFilters[field.key]"
            class="py-2 px-3 w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-neutral-500 rounded-l-lg"
            :class="localFilters[field.key] ? '' : 'rounded-r-lg'"
            type="text"
            :placeholder="field.placeholder"
            @input="setFilter(field.key, ($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="localFilters[field.key]"
            class="px-2.5 text-xs bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-50 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:hover:bg-neutral-700"
            @click="setFilter(field.key, '')"
          >
            &times;
          </button>
        </div>
      </div>
      <button
        v-if="activeFilterCount > 0"
        class="shrink-0 text-red-500 text-xs hover:text-red-600 transition-colors"
        @click="clearAll"
      >
        &times; {{ $t('settings.clearFilters') }}
      </button>
    </div>

    <!-- Sort row (omitted when no sortFields) -->
    <div
      v-if="sortFields.length"
      class="flex flex-wrap items-center gap-4 pl-5 pr-10 py-2 border-b border-gray-100 dark:border-neutral-700"
    >
      <span class="shrink-0 text-sm font-bold text-gray-700 dark:text-gray-200">
        {{ $t('settings.sortBy') }}
      </span>
      <div class="flex flex-wrap gap-4">
        <button
          v-for="field in sortFields"
          :key="field.key"
          class="flex items-center gap-1 text-sm font-semibold transition-colors"
          :class="
            sortKey === field.key
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400'
          "
          @click="$emit('sort', field.key)"
        >
          {{ field.label }}
          <svg
            v-if="sortKey === field.key"
            class="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="sortAsc ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';

interface FilterField {
  key: string;
  placeholder: string;
}
interface SortField {
  key: string;
  label: string;
}

const props = defineProps<{
  modelValue: Record<string, string>;
  filterFields: FilterField[];
  sortFields?: SortField[];
  sortKey?: string;
  sortAsc?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<string, string>): void;
  (e: 'sort', key: string): void;
}>();

const sortFields = computed(() => props.sortFields ?? []);
const sortKey = computed(() => props.sortKey ?? '');
const sortAsc = computed(() => props.sortAsc ?? true);

const localFilters = reactive<Record<string, string>>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => Object.assign(localFilters, val),
  { deep: true },
);
watch(localFilters, (val) => emit('update:modelValue', { ...val }), { deep: true });

const activeFilterCount = computed(() => Object.values(localFilters).filter(Boolean).length);

const setFilter = (key: string, value: string) => {
  localFilters[key] = value;
};
const clearAll = () => {
  Object.keys(localFilters).forEach((k) => (localFilters[k] = ''));
};
</script>
